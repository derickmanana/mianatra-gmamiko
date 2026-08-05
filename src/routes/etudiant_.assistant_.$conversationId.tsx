import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAi, fetchConversation } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/assistant_/$conversationId")({
  head: () => ({
    meta: [
      { title: "Assistant IA import Chine → Madagascar" },
      {
        name: "description",
        content:
          "Posez vos questions sur l'importation depuis la Chine vers Madagascar : produits, transitaires, transport, paiement et rentabilité.",
      },
      { property: "og:title", content: "Assistant IA import Chine → Madagascar" },
      { property: "og:description", content: "Un formateur virtuel spécialisé en importation Chine → Madagascar." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantThread,
});

const SUGGESTIONS = [
  "Analyse ce produit : montre connectée à 45 Ar… sur 1688",
  "Comment payer un achat sur Pinduoduo depuis Madagascar ?",
  "Aérien ou maritime pour 30 kg de vêtements ?",
];

function AssistantThread() {
  const { conversationId } = Route.useParams();
  const { name, ready } = useStudentProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !name) navigate({ to: "/etudiant" });
  }, [ready, name, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-conversation", conversationId, name],
    enabled: ready && !!name,
    queryFn: () => fetchConversation({ data: { studentName: name!, id: conversationId } }),
    retry: false,
  });

  const messages = data?.messages ?? [];

  const ask = useMutation({
    mutationFn: (question: string) => askAi({ data: { studentName: name!, id: conversationId, question } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["ai-conversation", conversationId, name] });
      qc.invalidateQueries({ queryKey: ["ai-conversations", name] });
      inputRef.current?.focus();
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId, ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, ask.isPending]);

  const submit = () => {
    const q = text.trim();
    if (q && !ask.isPending) ask.mutate(q);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-6 pt-5">
      <Link to="/etudiant/assistant" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Mes discussions
      </Link>

      <h1 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Bot className="size-5 text-primary" />
        {data?.title ?? "Assistant Import"}
      </h1>

      <div
        className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {isLoading || !ready ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="py-10 text-center text-sm text-destructive">{(error as Error).message}</p>
        ) : messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Posez votre question sur l'importation Chine → Madagascar.
            </p>
            <div className="mt-4 space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="block w-full rounded-2xl border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => ask.mutate(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none break-words dark:prose-invert [&_h2]:mt-3 [&_h2]:text-base [&_li]:my-0.5 [&_table]:block [&_table]:overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {ask.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> L'assistant analyse…
          </div>
        ) : null}
        {ask.error ? <p className="text-sm text-destructive">{(ask.error as Error).message}</p> : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          ref={inputRef}
          rows={2}
          className="min-h-[52px] resize-none"
          placeholder="Ex : Ce produit est-il rentable à Madagascar ?"
          value={text}
          maxLength={4000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || ask.isPending} aria-label="Envoyer">
          {ask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </main>
  );
}
