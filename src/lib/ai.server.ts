// Assistant IA spécialisé importation Chine -> Madagascar (serveur uniquement).
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildKnowledgeContext } from "./kb.server";

const MODEL = "google/gemini-3.6-flash";

/** Règles de comportement de l'assistant. Indépendantes de l'interface. */
function systemPrompt(knowledge: string) {
  return `Tu es "Assistant Import", le formateur virtuel d'une plateforme malgache de formation à l'importation de marchandises depuis la Chine vers Madagascar.

RÈGLES ABSOLUES
- Tu réponds UNIQUEMENT sur l'importation Chine -> Madagascar (produits, plateformes chinoises, transitaires, transport, paiement, revente à Madagascar).
- Si la question sort de ce domaine, tu refuses poliment en une phrase et tu ramènes l'étudiant vers la formation.
- Tu n'es jamais une IA généraliste. Tu parles comme un formateur malgache expérimenté.
- Langue : français simple, pédagogique, professionnel, adapté aux débutants. Phrases courtes, listes, emojis discrets autorisés.
- Contexte : marché malgache, prix en Ariary (Ar) et en dollars ($) quand utile.
- Tu ne calcules JAMAIS de droits de douane : les étudiants passent par des transitaires qui gèrent l'importation jusqu'à Madagascar.
- Tu utilises EN PRIORITÉ les données ci-dessous enregistrées par l'administrateur. Si une donnée manque, dis-le clairement et donne une estimation prudente en le précisant.
- Plateformes maîtrisées : Pinduoduo, 1688, Taobao, SHEIN. Paiement : Alipay, RedotPay, cartes Visa virtuelles et solutions utilisées localement.

FORMAT
- Affiche toujours un niveau de confiance : Faible, Moyen, Bon ou Excellent.
- Termine chaque réponse importante par ces trois sections : "Conseils du formateur", "Erreurs à éviter", "Étapes suivantes recommandées".
- Pour toute analyse de produit, produis un rapport clair en markdown avec ces lignes : Nom du produit, Plateforme, Prix d'achat, Estimation du poids, Mode de transport conseillé, Coût du transport estimé, Prix total estimé, Prix de vente conseillé à Madagascar, Estimation de la marge bénéficiaire, Niveau de concurrence, Niveau de risque, Conseils du formateur, Erreurs à éviter, puis "Décision finale" parmi : Achat conseillé / Achat possible avec prudence / Achat déconseillé.
- Estime le poids d'un produit inconnu à partir des produits de référence similaires fournis.

BASE DE CONNAISSANCES DU FORMATEUR
${knowledge || "(aucune donnée enregistrée pour le moment — préviens l'étudiant que tes réponses restent générales et prudentes)"}`;
}

/** Appel générique du modèle IA (utilisé aussi par l'analyse de produits). */
export async function runModel(system: string, prompt: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Assistant indisponible : clé IA manquante.");
  const gateway = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  try {
    const result = streamText({ model: gateway(MODEL), system, prompt });
    return await result.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("429")) throw new Error("Trop de demandes. Réessayez dans un instant.");
    if (message.includes("402")) throw new Error("Crédits IA épuisés. Contactez l'administrateur.");
    throw new Error(`L'assistant n'a pas pu répondre : ${message}`);
  }
}

/** Prompt système exporté pour les autres modules (analyse de produits). */
export const assistantSystemPrompt = systemPrompt;

export async function listConversations(studentName: string) {
  const { data, error } = await supabaseAdmin
    .from("ai_conversations")
    .select("id, title, updated_at")
    .eq("student_name", studentName)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createConversation(studentName: string) {
  const { data, error } = await supabaseAdmin
    .from("ai_conversations")
    .insert({ student_name: studentName })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Création impossible.");
  return data.id;
}

export async function deleteConversation(id: string, studentName: string) {
  const { error } = await supabaseAdmin
    .from("ai_conversations")
    .delete()
    .eq("id", id)
    .eq("student_name", studentName);
  if (error) throw new Error(error.message);
}

export async function listAiMessages(conversationId: string, studentName: string) {
  const { data: conv } = await supabaseAdmin
    .from("ai_conversations")
    .select("id, title, student_name")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv || conv.student_name !== studentName) throw new Error("Discussion introuvable.");

  const { data, error } = await supabaseAdmin
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return { title: conv.title, messages: data ?? [] };
}

/** Pose une question à l'assistant et enregistre l'échange. */
export async function askAssistant(conversationId: string, studentName: string, question: string) {
  const text = question.trim().slice(0, 4000);
  if (!text) throw new Error("Question vide.");

  const history = await listAiMessages(conversationId, studentName);
  const knowledge = await buildKnowledgeContext(text);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Assistant indisponible : clé IA manquante.");

  const gateway = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  let answer: string;
  try {
    const result = streamText({
      model: gateway(MODEL),
      system: systemPrompt(knowledge.text),
      messages: [
        ...history.messages.map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: text },
      ],
    });
    answer = await result.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("429")) throw new Error("Trop de demandes. Réessayez dans un instant.");
    if (message.includes("402")) throw new Error("Crédits IA épuisés. Contactez l'administrateur.");
    throw new Error(`L'assistant n'a pas pu répondre : ${message}`);
  }

  await supabaseAdmin.from("ai_messages").insert([
    { conversation_id: conversationId, role: "user", content: text },
    { conversation_id: conversationId, role: "assistant", content: answer },
  ]);

  const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
  if (history.messages.length === 0) patch.title = text.slice(0, 60);
  await supabaseAdmin.from("ai_conversations").update(patch).eq("id", conversationId);

  return answer;
}
