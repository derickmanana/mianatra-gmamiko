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
import { CreditBadge } from "@/components/CreditBadge";
import { PaywallDialog, isPaywallError } from "@/components/PaywallDialog";

export const Route = createFileRoute("/etudiant_/analyse")({
  head: () => ({
    meta: [
      { title: "Famakafakana vokatra — Fanafarana avy any Shina ho any Madagasikara" },
      {
        name: "description",
        content: "Diniho ny tombom-barotry ny vokatra sinoa alohan'ny hanafarana azy any Madagasikara : vidiny, tombony, loza mety hitranga.",
      },
      { property: "og:title", content: "Famakafakana vokatra — Fanafarana avy any Shina ho any Madagasikara" },
      { property: "og:description", content: "Tatitra feno : vidiny rehetra, vidin'ny varotra tolorina, tombony ary fanapahan-kevitra." },
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
  const [productUrl, setProductUrl] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);

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
          productUrl: productUrl.trim(),
          weightKg: weight.trim() ? Number(weight.replace(",", ".")) : null,
          transportMode,
        },
      }),

    onSuccess: (r) => {
      setReport(r.report);
      qc.invalidateQueries({ queryKey: ["analyses", name] });
      qc.invalidateQueries({ queryKey: ["my-account", name] });
    },
    onError: (e: Error) => {
      if (isPaywallError(e)) setPaywall(true);
      else toast.error(e.message);
    },
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
        <ArrowLeft className="size-4" /> Sehatry mpianatra
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
          <PackageSearch className="size-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Famakafakana vokatra</h1>
          <p className="text-sm text-muted-foreground">Tombom-barotra, fitaterana, tombony ary fanapahan-kevitra farany</p>
        </div>
        {name ? <CreditBadge studentName={name} onClick={() => setPaywall(true)} /> : null}
      </div>
      {name ? <PaywallDialog studentName={name} open={paywall} onOpenChange={setPaywall} /> : null}

      <form
        className="mt-5 space-y-3 rounded-3xl border border-border bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (productName.trim()) analyse.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label>Anaran'ny vokatra</Label>
          <Input
            placeholder="Ohatra : famantaranandro connectée"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Sehatra</Label>
            <Input placeholder="1688, Pinduoduo…" value={platform} onChange={(e) => setPlatform(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Vidin'ny fividianana</Label>
            <Input placeholder="Ohatra : 35 ¥" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Rohin'ny vokatra (tsy tsy maintsy)</Label>
          <Input
            inputMode="url"
            placeholder="https://detail.1688.com/…"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Miezaka mamaky ny pejy ny mpanampy. Raha tsy vitany izany, dia lazainy aminao fa tsy hamorona valiny.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Isa</Label>
            <Input
              inputMode="numeric"
              placeholder="Ohatra : 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Lanja (kg)</Label>
            <Input
              inputMode="decimal"
              placeholder="Ohatra : 0,4"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Fitaterana</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
            >
              <option value="">Tolorina</option>
              <option value="Aérien">Aérien</option>
              <option value="Maritime">Maritime</option>
              <option value="Aérien express">Aérien express</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Fanazavana fanampiny (tsy tsy maintsy)</Label>
          <Textarea
            rows={3}
            placeholder="Habe, akora, bateria, rano, marefo…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={analyse.isPending || !productName.trim()}>
          {analyse.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Hamakafaka ity vokatra ity
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
          <h2 className="mb-2 text-lg font-semibold">Ny famakafakako teo aloha</h2>
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
                <Button variant="ghost" size="icon" aria-label="Fafao" onClick={() => del.mutate(a.id)}>
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
