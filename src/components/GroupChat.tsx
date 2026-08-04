import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, Trash2 } from "lucide-react";
import { clearAllMessages, fetchMessages, removeMessage, sendMessage } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function GroupChat({ authorName, adminCode }: { authorName: string; adminCode?: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => fetchMessages(),
    refetchInterval: 5000,
  });

  const messages = data ?? [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["messages"] });

  const send = useMutation({
    mutationFn: (body: string) =>
      sendMessage({ data: { authorName, body, ...(adminCode ? { adminCode } : {}) } }),
    onSuccess: () => {
      setText("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeMessage({ data: { adminCode: adminCode!, id } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const clearAll = useMutation({
    mutationFn: () => clearAllMessages({ data: { adminCode: adminCode! } }),
    onSuccess: () => {
      toast.success("Discussion effacée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-[60vh] flex-col">
      {adminCode ? (
        <div className="mb-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()}>
            Effacer la discussion
          </Button>
        </div>
      ) : null}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucun message. Démarrez la discussion !
          </p>
        ) : (
          messages.map((m) => {
            const mine = !adminCode
              ? !m.is_admin && m.author_name.toLowerCase() === authorName.toLowerCase()
              : m.is_admin;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <div className="mb-0.5 flex items-center gap-2 text-xs opacity-75">
                    <span className="font-semibold">{m.is_admin ? "Administrateur" : m.author_name}</span>
                    <span>{timeLabel(m.created_at)}</span>
                    {adminCode ? (
                      <button aria-label="Supprimer le message" onClick={() => del.mutate(m.id)}>
                        <Trash2 className="size-3" />
                      </button>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send.mutate(text.trim());
        }}
      >
        <Input
          placeholder="Écrire un message…"
          value={text}
          maxLength={2000}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || send.isPending} aria-label="Envoyer">
          {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
