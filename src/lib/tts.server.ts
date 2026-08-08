// Synthèse vocale (serveur uniquement) via la passerelle IA Lovable.

const MODEL = "openai/gpt-4o-mini-tts";
const MAX_WORDS = 350;

/** Découpe le texte en morceaux sûrs pour le modèle TTS. */
function chunkForTTS(text: string, maxWords = MAX_WORDS): string[] {
  const wordCount = (s: string) => (s.match(/\S+/g) ?? []).length;
  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const sentence of sentences) {
    if (wordCount(sentence) > maxWords) {
      flush();
      const words = sentence.match(/\S+/g) ?? [];
      for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(" "));
      }
      continue;
    }
    if (current && wordCount(current) + wordCount(sentence) > maxWords) flush();
    current += sentence;
  }
  flush();
  return chunks;
}

/** Nettoie le markdown pour une lecture naturelle. */
function cleanForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function speakChunk(input: string, apiKey: string): Promise<Uint8Array> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      input,
      voice: "alloy",
      response_format: "mp3",
      instructions:
        "Lis ce texte comme un formateur malgache : prononciation malgache naturelle pour les mots malgaches, française pour les mots français. Débit calme et pédagogique.",
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Trop de demandes audio. Réessayez dans un instant.");
    if (response.status === 402) throw new Error("Crédits IA épuisés. Contactez l'administrateur.");
    throw new Error(`Lecture audio impossible (${response.status}) ${body}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/** Génère l'audio MP3 (base64) d'une réponse de l'assistant. */
export async function synthesizeSpeech(text: string): Promise<string> {
  const clean = cleanForSpeech(text).slice(0, 6000);
  if (!clean) throw new Error("Rien à lire.");
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Lecture audio indisponible : clé IA manquante.");

  const parts: Uint8Array[] = [];
  for (const chunk of chunkForTTS(clean)) {
    parts.push(await speakChunk(chunk, apiKey));
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    merged.set(p, offset);
    offset += p.length;
  }
  return Buffer.from(merged).toString("base64");
}
