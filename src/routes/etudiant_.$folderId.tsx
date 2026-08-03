import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Minus, Plus, Search } from "lucide-react";
import { fetchFolderContent } from "@/lib/content.functions";
import { ItemViewer } from "@/components/ItemViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/etudiant_/$folderId")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search['code'] === "string" ? (search['code'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Consultation du dossier — Cours & Documents" },
      { name: "description", content: "Lisez les cours, images zoomables, PDF, documents Word et liens du dossier." },
      { property: "og:title", content: "Consultation du dossier — Cours & Documents" },
      { property: "og:description", content: "Lecture confortable des contenus de formation sur mobile." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentFolder,
});

function StudentFolder() {
  const { folderId } = Route.useParams();
  const { code } = Route.useSearch();
  const [fontScale, setFontScale] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["folder", folderId, code],
    queryFn: () => fetchFolderContent({ data: { folderId, ...(code ? { code } : {}) } }),
    retry: false,
  });

  const blocks = (data?.blocks ?? []).filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.items.some((i) => `${i.title ?? ""} ${i.content ?? ""}`.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-16 pt-5">
      <Link to="/etudiant" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Dossiers
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">{(error as Error).message}</p>
          <Link to="/etudiant" className="mt-3 inline-block text-sm text-primary">
            Retour aux dossiers
          </Link>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border bg-background/90 px-4 pb-3 pt-1 backdrop-blur">
            <h1 className="text-2xl font-bold">{data?.folder.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Rechercher dans le dossier"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Réduire le texte"
                onClick={() => setFontScale((s) => Math.max(0.85, +(s - 0.15).toFixed(2)))}
              >
                <Minus className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Agrandir le texte"
                onClick={() => setFontScale((s) => Math.min(2.5, +(s + 0.15).toFixed(2)))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {blocks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Aucun contenu pour le moment.
            </p>
          ) : (
            <div className="space-y-6">
              {blocks.map((block) => (
                <section key={block.id}>
                  <h2 className="mb-3 text-lg font-semibold text-primary">{block.name}</h2>
                  <div className="space-y-3">
                    {block.items.map((item) => (
                      <ItemViewer key={item.id} item={item} fontScale={fontScale} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
