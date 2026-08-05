// Base de connaissances de l'assistant IA (import Chine -> Madagascar).
// Module serveur uniquement : jamais importé depuis le client.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Catégories proposées à l'administrateur pour classer les connaissances. */
export const KB_CATEGORIES = [
  "Pinduoduo",
  "1688",
  "Taobao",
  "SHEIN",
  "Fournisseurs",
  "Transitaires",
  "Paiement",
  "Produits",
  "Transport",
  "Conseils",
  "Erreurs fréquentes",
  "Expériences",
  "Tutoriels",
  "Marché malgache",
  "Autres",
] as const;

export type KbEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  is_active: boolean;
  updated_at: string;
};

export type Forwarder = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat: string | null;
  facebook: string | null;
  website: string | null;
  city: string | null;
  departure_country: string;
  air_rate_ar_kg: number | null;
  sea_rate_usd_m3: number | null;
  delivery_standard: string | null;
  delivery_express: string | null;
  avg_delay: string | null;
  notes: string | null;
  is_active: boolean;
  rates_updated_at: string;
};

export type KbProduct = {
  id: string;
  name: string;
  category: string | null;
  material: string | null;
  dimensions: string | null;
  weight_kg: number | null;
  is_fragile: boolean;
  has_battery: boolean;
  is_liquid: boolean;
  transport_advice: string | null;
};

export type KbSupplier = {
  id: string;
  name: string;
  platform: string | null;
  shop_url: string | null;
  status: string;
  notes: string | null;
};

type Table = "kb_entries" | "forwarders" | "kb_products" | "kb_suppliers";

export async function kbList(table: Table, search = "") {
  let query = supabaseAdmin.from(table).select("*").order("updated_at", { ascending: false }).limit(500);
  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query =
      table === "kb_entries"
        ? (query.or(`title.ilike.${s},content.ilike.${s},category.ilike.${s}`) as typeof query)
        : (query.or(`name.ilike.${s}`) as typeof query);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function kbSave(table: Table, id: string | null, values: Record<string, unknown>) {
  const { error } = id
    ? await supabaseAdmin.from(table).update(values).eq("id", id)
    : await supabaseAdmin.from(table).insert(values);
  if (error) throw new Error(error.message);
}

export async function kbDelete(table: Table, id: string) {
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Découpe une question en mots-clés utiles pour la recherche. */
function keywords(question: string) {
  return question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
}

function score(text: string, words: string[]) {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return words.reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
}

/**
 * Construit le contexte transmis à l'IA : les connaissances les plus
 * pertinentes pour la question posée. Indépendant de l'interface.
 */
export async function buildKnowledgeContext(question: string) {
  const words = keywords(question);

  const [entriesRes, forwardersRes, productsRes, suppliersRes] = await Promise.all([
    supabaseAdmin.from("kb_entries").select("category, title, content, tags").eq("is_active", true).limit(400),
    supabaseAdmin.from("forwarders").select("*").eq("is_active", true).limit(60),
    supabaseAdmin.from("kb_products").select("*").limit(500),
    supabaseAdmin.from("kb_suppliers").select("*").limit(200),
  ]);

  const entries = (entriesRes.data ?? [])
    .map((e) => ({ e, s: score(`${e.category} ${e.title} ${e.content} ${(e.tags ?? []).join(" ")}`, words) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 25)
    .map(({ e }) => `[${e.category}] ${e.title}\n${e.content}`);

  const products = (productsRes.data ?? [])
    .map((p) => ({ p, s: score(`${p.name} ${p.category ?? ""} ${p.material ?? ""}`, words) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 25)
    .map(
      ({ p }) =>
        `${p.name} | catégorie: ${p.category ?? "-"} | matière: ${p.material ?? "-"} | dimensions: ${
          p.dimensions ?? "-"
        } | poids réel: ${p.weight_kg ?? "-"} kg | fragile: ${p.is_fragile ? "oui" : "non"} | batterie: ${
          p.has_battery ? "oui" : "non"
        } | liquide: ${p.is_liquid ? "oui" : "non"} | conseil: ${p.transport_advice ?? "-"}`,
    );

  const forwarders = (forwardersRes.data ?? []).map(
    (f) =>
      `${f.name} (${f.city ?? "-"}, départ ${f.departure_country}) | aérien: ${
        f.air_rate_ar_kg ?? "-"
      } Ar/kg | maritime: ${f.sea_rate_usd_m3 ?? "-"} $/m³ | standard: ${f.delivery_standard ?? "-"} | express: ${
        f.delivery_express ?? "-"
      } | délai: ${f.avg_delay ?? "-"} | tél: ${f.phone ?? "-"} | WhatsApp: ${f.whatsapp ?? "-"} | WeChat: ${
        f.wechat ?? "-"
      } | Facebook: ${f.facebook ?? "-"} | site: ${f.website ?? "-"} | tarifs mis à jour le ${new Date(
        f.rates_updated_at,
      ).toLocaleDateString("fr-FR")}${f.notes ? ` | notes: ${f.notes}` : ""}`,
  );

  const suppliers = (suppliersRes.data ?? []).map(
    (s) =>
      `${s.name} | plateforme: ${s.platform ?? "-"} | statut: ${s.status} | ${s.shop_url ?? ""} ${s.notes ?? ""}`.trim(),
  );

  const sections: string[] = [];
  if (entries.length) sections.push(`## Connaissances du formateur\n${entries.join("\n\n")}`);
  if (forwarders.length) sections.push(`## Transitaires et tarifs\n${forwarders.join("\n")}`);
  if (products.length) sections.push(`## Produits de référence (poids réels)\n${products.join("\n")}`);
  if (suppliers.length) sections.push(`## Fournisseurs et boutiques\n${suppliers.join("\n")}`);

  return {
    text: sections.join("\n\n"),
    counts: {
      entries: entriesRes.data?.length ?? 0,
      forwarders: forwardersRes.data?.length ?? 0,
      products: productsRes.data?.length ?? 0,
      suppliers: suppliersRes.data?.length ?? 0,
    },
  };
}
