// Moteur de recherche global de la base de connaissances (serveur uniquement).
// Recherche insensible à la casse et aux accents, tolérante aux mots partiels,
// sur toutes les tables pertinentes.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Normalise un texte : minuscules, sans accents, ponctuation réduite. */
export function norm(text: string) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

const STOP = new Set([
  "ary","dia","ary","amin","amina","izay","ianao","aho","izy","ny","ao","ve","no","fa","ka","sy","ho","ilay",
  "les","des","une","uns","est","que","qui","pour","avec","dans","sur","par","pas","plus","cette","cet","ces",
  "the","and","you","for","with","what","how","about","tell","hoe","atao","inona","ahoana","misy","ity","ireo",
  "azafady","mba","tsy","efa","koa","aiza","oviana","iza","raha","rehefa","satria","noho","anao","anay",
]);

/** Découpe une question en jetons utiles (>= 3 caractères, hors mots vides). */
export function tokens(question: string) {
  const raw = norm(question).split(" ").filter(Boolean);
  const kept = raw.filter((w) => w.length >= 3 && !STOP.has(w));
  return Array.from(new Set(kept.length ? kept : raw));
}

/** Nombre de jetons retrouvés dans un texte, avec bonus si présent dans un champ fort. */
function hits(text: string, words: string[]) {
  const t = norm(text);
  if (!t) return 0;
  let n = 0;
  for (const w of words) {
    if (t.includes(w)) {
      n += 1;
      continue;
    }
    // Tolérance : mot partiel inverse (l'entrée est plus courte que le jeton)
    if (w.length >= 5 && t.split(" ").some((p) => p.length >= 4 && w.includes(p))) n += 0.5;
  }
  return n;
}

export type Scored<T> = { row: T; score: number; strong: boolean };

/**
 * Classe des lignes : `strong` = au moins un jeton retrouvé dans un champ
 * identifiant (titre, nom, mots-clés, catégorie).
 */
export function rank<T extends Record<string, unknown>>(
  rows: T[],
  words: string[],
  strongFields: (keyof T)[],
  weakFields: (keyof T)[],
): Scored<T>[] {
  if (!words.length) return rows.map((row) => ({ row, score: 0, strong: false }));
  return rows
    .map((row) => {
      const strongText = strongFields.map((f) => stringify(row[f])).join(" ");
      const weakText = weakFields.map((f) => stringify(row[f])).join(" ");
      const s = hits(strongText, words);
      const w = hits(weakText, words);
      return { row, score: s * 4 + w, strong: s > 0 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function stringify(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ");
  return String(v);
}

export type GlobalSearch = Awaited<ReturnType<typeof globalSearch>>;

/**
 * Recherche globale : charge les tables pertinentes puis classe les lignes.
 * Renvoie à la fois les correspondances (matched) et un fond général (fallback)
 * pour que l'assistant garde du contexte même sans correspondance.
 */
export async function globalSearch(question: string) {
  const words = tokens(question);

  const [entries, forwarders, products, suppliers, folders, items] = await Promise.all([
    supabaseAdmin.from("kb_entries").select("category, title, content, tags, updated_at").eq("is_active", true).limit(1000),
    supabaseAdmin.from("forwarders").select("*").eq("is_active", true).limit(200),
    supabaseAdmin.from("kb_products").select("*").limit(1000),
    supabaseAdmin.from("kb_suppliers").select("*").limit(500),
    supabaseAdmin.from("folders").select("id, name").limit(200),
    supabaseAdmin.from("items").select("title, content, type, block_id").in("type", ["text", "link"]).limit(800),
  ]);

  const e = rank(entries.data ?? [], words, ["title", "tags", "category"], ["content"]);
  const f = rank(forwarders.data ?? [], words, ["name", "city"], ["notes", "departure_country", "delivery_standard", "delivery_express"]);
  const p = rank(products.data ?? [], words, ["name", "category"], ["material", "transport_advice", "dimensions"]);
  const s = rank(suppliers.data ?? [], words, ["name", "platform"], ["notes", "shop_url"]);
  const fo = rank(folders.data ?? [], words, ["name"], []);
  const it = rank(items.data ?? [], words, ["title"], ["content"]);

  return {
    words,
    entries: e,
    forwarders: f,
    products: p,
    suppliers: s,
    folders: fo,
    items: it,
    all: {
      entries: entries.data ?? [],
      forwarders: forwarders.data ?? [],
      products: products.data ?? [],
      suppliers: suppliers.data ?? [],
    },
    matchCount: e.length + f.length + p.length + s.length + fo.length + it.length,
    strongCount:
      e.filter((r) => r.strong).length +
      f.filter((r) => r.strong).length +
      p.filter((r) => r.strong).length +
      s.filter((r) => r.strong).length,
  };
}
