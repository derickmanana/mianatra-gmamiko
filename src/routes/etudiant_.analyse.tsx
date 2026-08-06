import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PackageSearch, Trash2 } from "lucide-react";
import { fetchAnalyses, removeAnalysis, runProductAnalysis } from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/analyse")({
  head: () => ({
    meta: [
      { title: "Analyse de produit — Import Chine → Madagascar" },
      {
        name: "description",
        content: "Analysez la rentabilité d'un produit chinois avant de l'importer à Madagascar : coût, marge, risque.",
      },
      { property: "og:title", content: "Analyse de produit — Import Chine → Madagascar" },
      { property: "og:description", content: "Rapport complet : coût total, prix de vente conseillé, marge et décision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalysePage,
});

function AnalysePage() {
  const { name, ready } = useStudentProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [productName, setProductName] = useState("");
  const [platform, setPlatform] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState<string | null>(null);

  const { data: history } = useQuery({
    queryKey: ["analyses", name],
    enabled: ready && !!name,
    queryFn: () => fetchAnalyses({ data: { studentName: name! } }),
  });

  const analyse = useMutation({
    mutationFn: () =>
      runProductAnalysis({
        data: {
          studentName: name!,
          productName,
          platform,
          purchasePrice,
          quantity: quantity.trim() ? Number(quantity) : null,
          notes,
        },
      }),
    onSuccess: (r) => {
      setReport(r.report);
      qc.invalidateQueries({ queryKey: ["analyses", name] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeAnalysis({ data: { studentName: name!, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analyses", name] }),
  });

  if (ready && !name) {
    navigate({ to: "/etudiant" });
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/etudiant" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Espace étudiant
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
          <PackageSearch className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analyse de produit</h1>
          <p className="text-sm text-muted-foreground">Rentabilité, transport, marge et décision finale</p>
        </div>
      </div>

      <form
        className="mt-5 space-y-3 rounded-3xl border border-border bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (productName.trim()) analyse.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label>Nom du produit</Label>
          <Input
            placeholder="Ex : montre connectée"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Plateforme</Label>
            <Input placeholder="1688, Pinduoduo…" value={platform} onChange={(e) => setPlatform(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix d'achat</Label>
            <Input placeholder="Ex : 35 ¥" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Quantité envisagée</Label>
          <Input
            inputMode="numeric"
            placeholder="Ex : 50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Précisions (facultatif)</Label>
          <Textarea
            rows={3}
            placeholder="Dimensions, matière, batterie, lien du produit…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={analyse.isPending || !productName.trim()}>
          {analyse.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Analyser ce produit
        </Button>
      </form>

      {report && (
        <article
          className="prose prose-sm mt-5 max-w-none rounded-3xl border border-border bg-card p-4 dark:prose-invert"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        </article>
      )}

      {(history ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Mes analyses précédentes</h2>
          <div className="space-y-2">
            {(history ?? []).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <button className="min-w-0 flex-1 text-left" onClick={() => setReport(a.report)}>
                  <p className="truncate text-sm font-medium">{a.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.platform ?? "—"} · {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </button>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => del.mutate(a.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
