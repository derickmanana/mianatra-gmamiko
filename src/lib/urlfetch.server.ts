// Lecture sécurisée d'URL publiques côté serveur (anti-SSRF).
// Ne jamais inventer de contenu : si la lecture échoue, on renvoie l'erreur.

const MAX_BYTES = 900_000;
const MAX_CHARS = 12_000;
const TIMEOUT_MS = 12_000;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
  "instance-data",
]);

/** Vrai si l'hôte pointe vers une adresse interne / privée. */
function isPrivateHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(h)) return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^127\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(h)) return true; // ULA IPv6
  if (/^fe80:/i.test(h)) return true;
  return false;
}

/** Détecte les URL http(s) présentes dans un texte (max 3). */
export function extractUrls(text: string): string[] {
  const found = text.match(/https?:\/\/[^\s<>"')]+/gi) ?? [];
  return Array.from(new Set(found.map((u) => u.replace(/[.,;:]+$/, "")))).slice(0, 3);
}

export type FetchedPage =
  | { url: string; ok: true; title: string; text: string }
  | { url: string; ok: false; reason: string };

/** Convertit du HTML en texte lisible (sans scripts, styles ni balises). */
function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Récupère et extrait le contenu lisible d'une page publique. */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { url: rawUrl, ok: false, reason: "URL tsy mety (format diso)." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { url: rawUrl, ok: false, reason: "Protocole tsy azo ampiasaina (http/https ihany)." };
  }
  if (isPrivateHost(url.hostname)) {
    return { url: rawUrl, ok: false, reason: "Adiresy anatiny voarara." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; GmamikoBot/1.0)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        "accept-language": "fr,mg,en;q=0.8",
      },
    });

    // Vérifie l'hôte final après redirections.
    try {
      const finalHost = new URL(res.url || url.toString()).hostname;
      if (isPrivateHost(finalHost)) return { url: rawUrl, ok: false, reason: "Redirection mankany amin'ny adiresy anatiny." };
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      return { url: rawUrl, ok: false, reason: `Ny site namaly HTTP ${res.status}.` };
    }
    const ctype = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!ctype.includes("text/html") && !ctype.includes("text/plain") && !ctype.includes("application/json") && !ctype.includes("xml")) {
      return { url: rawUrl, ok: false, reason: `Karazana fichier tsy azo vakiana (${ctype || "tsy fantatra"}).` };
    }
    const len = Number(res.headers.get("content-length") ?? "0");
    if (len && len > MAX_BYTES) {
      return { url: rawUrl, ok: false, reason: "Pejy lehibe loatra." };
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return { url: rawUrl, ok: false, reason: "Pejy lehibe loatra." };
    }
    const html = new TextDecoder("utf-8").decode(buf);
    const title = (html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i)?.[1] ?? "").trim();
    const text = ctype.includes("text/html") ? htmlToText(html) : html.trim();

    if (text.replace(/\s/g, "").length < 60) {
      return {
        url: rawUrl,
        ok: false,
        reason: "Tsy nisy soratra azo nalaina (pejy dynamique, mila login na arovana amin'ny bot).",
      };
    }
    return { url: rawUrl, ok: true, title, text: text.slice(0, MAX_CHARS) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "tsy fantatra";
    const reason = /abort/i.test(msg) ? "Ela loatra ny valiny (timeout)." : `Tsy tafiditra tamin'ny pejy (${msg}).`;
    return { url: rawUrl, ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Lit toutes les URL détectées dans un texte. */
export async function readLinksIn(text: string): Promise<FetchedPage[]> {
  const urls = extractUrls(text);
  if (!urls.length) return [];
  return Promise.all(urls.map((u) => fetchPage(u)));
}

/** Bloc de contexte prêt à être injecté dans le prompt de l'IA. */
export function linksContext(pages: FetchedPage[]) {
  if (!pages.length) return "";
  return pages
    .map((p) =>
      p.ok
        ? `### LIEN LU AVEC SUCCÈS : ${p.url}\nTitre: ${p.title || "-"}\n${p.text}`
        : `### LIEN NON LU : ${p.url}\nRaison: ${p.reason}\n(NE JAMAIS inventer le contenu de ce lien : dis clairement à l'étudiant que tu n'as pas pu le lire et pourquoi.)`,
    )
    .join("\n\n");
}
