import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, Loader2, MessageSquarePlus, Trash2 } from "lucide-react";
import { fetchConversations, newConversation, removeConversation } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/hooks/use-student-profile";
import { TtsSettingsDialog } from "@/components/TtsSettingsDialog";

export const Route = createFileRoute("/etudiant_/assistant")({
  head: () => ({
    meta: [
      { title: "Mes discussions avec l'assistant IA — Import Chine → Madagascar" },
      {
        name: "description",
        content: "Retrouvez toutes vos discussions avec l'assistant spécialisé en importation Chine → Madagascar.",
      },
      { property: "og:title", content: "Mes discussions avec l'assistant IA" },
      { property: "og:description", content: "Assistant de formation en importation Chine → Madagascar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantList,
});

function AssistantList() {
  const { name, ready } = useStudentProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (ready && !name) navigate({ to: "/etudiant" });
  }, [ready, name, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-conversations", name],
    enabled: ready && !!name,
    queryFn: () => fetchConversations({ data: { studentName: name! } }),
  });

  const create = useMutation({
    mutationFn: () => newConversation({ data: { studentName: name! } }),
    onSuccess: (r) =>
      navigate({ to: "/etudiant/assistant/$conversationId", params: { conversationId: r.id } }),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeConversation({ data: { studentName: name!, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-conversations", name] }),
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/etudiant" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Espace étudiant
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
          <Bot className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">Assistant Import</h1>
          <p className="text-sm text-muted-foreground">Spécialisé Chine → Madagascar</p>
        </div>
        <TtsSettingsDialog />
      </div>

      <Button className="mt-5 w-full" onClick={() => create.mutate()} disabled={create.isPending || !name}>
        {create.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MessageSquarePlus className="mr-2 size-4" />}
        Nouvelle discussion
      </Button>

      <div className="mt-6 space-y-2">
        {isLoading || !ready ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune discussion pour le moment.
          </p>
        ) : (
          (data ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <Link
                to="/etudiant/assistant/$conversationId"
                params={{ conversationId: c.id }}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.updated_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Supprimer la discussion"
                onClick={() => del.mutate(c.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
