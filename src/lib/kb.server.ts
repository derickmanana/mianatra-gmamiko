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
  // Les colonnes varient selon la table : on contourne l'union de types générée.
  const client = supabaseAdmin.from(table) as unknown as {
    update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
    insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
  const { error } = id ? await client.update(values).eq("id", id) : await client.insert(values);
  if (error) throw new Error(error.message);
}

export async function kbDelete(table: Table, id: string) {
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Construit le contexte transmis à l'IA.
 * Priorité absolue aux connaissances enregistrées par l'administrateur :
 * on cherche d'abord des correspondances (même partielles) dans toutes les
 * tables, puis on complète avec un fond général.
 */
export async function buildKnowledgeContext(question: string) {
  const { globalSearch } = await import("./search.server");
  const r = await globalSearch(question);

  const sections: string[] = [];

  const matchedEntries = r.entries.slice(0, 30);
  const matchedForwarders = r.forwarders.slice(0, 15);
  const matchedProducts = r.products.slice(0, 25);
  const matchedSuppliers = r.suppliers.slice(0, 20);

  const fmtEntry = (e: { category: string; title: string; content: string; tags: string[] | null }) =>
    `[${e.category}] ${e.title}${e.tags?.length ? ` (mots-clés: ${e.tags.join(", ")})` : ""}\n${e.content}`;

  const fmtProduct = (p: KbProduct) =>
    `${p.name} | catégorie: ${p.category ?? "-"} | matière: ${p.material ?? "-"} | dimensions: ${
      p.dimensions ?? "-"
    } | POIDS RÉEL ENREGISTRÉ: ${p.weight_kg ?? "non enregistré"} kg | fragile: ${
      p.is_fragile ? "oui" : "non"
    } | batterie: ${p.has_battery ? "oui" : "non"} | liquide: ${p.is_liquid ? "oui" : "non"} | conseil: ${
      p.transport_advice ?? "-"
    }`;

  const fmtForwarder = (f: Forwarder) =>
    `${f.name} (${f.city ?? "-"}, départ ${f.departure_country}) | aérien: ${f.air_rate_ar_kg ?? "-"} Ar/kg | maritime: ${
      f.sea_rate_usd_m3 ?? "-"
    } $/m³ | standard: ${f.delivery_standard ?? "-"} | express: ${f.delivery_express ?? "-"} | délai: ${
      f.avg_delay ?? "-"
    } | tél: ${f.phone ?? "-"} | WhatsApp: ${f.whatsapp ?? "-"} | WeChat: ${f.wechat ?? "-"} | Facebook: ${
      f.facebook ?? "-"
    } | site: ${f.website ?? "-"} | tarifs enregistrés le ${new Date(f.rates_updated_at).toLocaleDateString("fr-FR")}${
      f.notes ? ` | notes: ${f.notes}` : ""
    }`;

  const fmtSupplier = (s: KbSupplier) =>
    `${s.name} | plateforme: ${s.platform ?? "-"} | statut: ${s.status} | ${s.shop_url ?? ""} ${s.notes ?? ""}`.trim();

  // 1. Correspondances directes — l'IA DOIT les utiliser.
  if (r.matchCount > 0) {
    const parts: string[] = [];
    if (matchedEntries.length)
      parts.push(`#### Connaissances correspondantes\n${matchedEntries.map((m) => fmtEntry(m.row as never)).join("\n\n")}`);
    if (matchedForwarders.length)
      parts.push(`#### Transitaires correspondants\n${matchedForwarders.map((m) => fmtForwarder(m.row as never)).join("\n")}`);
    if (matchedProducts.length)
      parts.push(`#### Produits correspondants\n${matchedProducts.map((m) => fmtProduct(m.row as never)).join("\n")}`);
    if (matchedSuppliers.length)
      parts.push(`#### Fournisseurs correspondants\n${matchedSuppliers.map((m) => fmtSupplier(m.row as never)).join("\n")}`);
    if (r.folders.length)
      parts.push(`#### Dossiers de formation correspondants\n${r.folders.slice(0, 10).map((m) => (m.row as { name: string }).name).join(", ")}`);
    if (r.items.length)
      parts.push(
        `#### Contenus de cours correspondants\n${r.items
          .slice(0, 15)
          .map((m) => {
            const i = m.row as { title: string | null; content: string | null };
            return `${i.title ?? "(sans titre)"} — ${(i.content ?? "").slice(0, 600)}`;
          })
          .join("\n")}`,
      );
    sections.push(`## RÉSULTATS DE RECHERCHE (PRIORITÉ ABSOLUE — utilise ces informations)\n${parts.join("\n\n")}`);
  }

  // 2. Fond général, pour garder du contexte métier.
  const usedEntryTitles = new Set(matchedEntries.map((m) => (m.row as { title: string }).title));
  const rest = r.all.entries.filter((e) => !usedEntryTitles.has(e.title)).slice(0, 20);
  if (rest.length) sections.push(`## Autres connaissances du formateur\n${rest.map((e) => fmtEntry(e as never)).join("\n\n")}`);
  if (r.all.forwarders.length)
    sections.push(`## Tous les transitaires enregistrés\n${r.all.forwarders.map((f) => fmtForwarder(f as never)).join("\n")}`);
  if (r.all.products.length)
    sections.push(
      `## Produits de référence (poids réels enregistrés)\n${r.all.products.slice(0, 60).map((p) => fmtProduct(p as never)).join("\n")}`,
    );
  if (r.all.suppliers.length)
    sections.push(`## Fournisseurs enregistrés\n${r.all.suppliers.map((s) => fmtSupplier(s as never)).join("\n")}`);

  return {
    text: sections.join("\n\n"),
    matchCount: r.matchCount,
    strongCount: r.strongCount,
    words: r.words,
    counts: {
      entries: r.all.entries.length,
      forwarders: r.all.forwarders.length,
      products: r.all.products.length,
      suppliers: r.all.suppliers.length,
    },
  };
}

