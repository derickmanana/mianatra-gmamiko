import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminDeleteQuestion,
  adminDeleteQuiz,
  adminFetchQuestions,
  adminFetchQuizzes,
  adminSaveQuestion,
  adminSaveQuiz,
} from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminCode } from "@/hooks/use-admin-code";

export const Route = createFileRoute("/admin_/quiz")({
  head: () => ({
    meta: [
      { title: "Fitantanana quiz — Fitantanana" },
      { name: "description", content: "Mamoròna sy manova ny fitsapana amin'ny fampiofanana import Sina → Madagasikara." },
      { property: "og:title", content: "Fitantanana quiz — Fitantanana" },
      { property: "og:description", content: "Mamoròna ny fanontaniana, valiny ary fanazavana ao amin'ny quiz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminQuiz,
});

type QuizForm = { id?: string; title: string; description: string; is_active: boolean };
type QuestionForm = {
  id?: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

const emptyQuestion: QuestionForm = { question: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "" };

function AdminQuiz() {
  const { code, ready } = useAdminCode();
  const qc = useQueryClient();
  const [openQuiz, setOpenQuiz] = useState<QuizForm | null>(null);
  const [selected, setSelected] = useState<{ id: string; title: string } | null>(null);
  const [openQuestion, setOpenQuestion] = useState<QuestionForm | null>(null);

  const quizzes = useQuery({
    queryKey: ["admin-quizzes"],
    enabled: ready && !!code,
    queryFn: () => adminFetchQuizzes({ data: { adminCode: code! } }),
  });

  const questions = useQuery({
    queryKey: ["admin-questions", selected?.id],
    enabled: !!selected && !!code,
    queryFn: () => adminFetchQuestions({ data: { adminCode: code!, quizId: selected!.id } }),
  });

  const saveQuiz = useMutation({
    mutationFn: (f: QuizForm) =>
      adminSaveQuiz({
        data: {
          adminCode: code!,
          ...(f.id ? { id: f.id } : {}),
          title: f.title.trim(),
          description: f.description.trim() || null,
          is_active: f.is_active,
        },
      }),
    onSuccess: () => {
      setOpenQuiz(null);
      qc.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delQuiz = useMutation({
    mutationFn: (id: string) => adminDeleteQuiz({ data: { adminCode: code!, id } }),
    onSuccess: () => {
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
  });

  const saveQuestion = useMutation({
    mutationFn: (f: QuestionForm) =>
      adminSaveQuestion({
        data: {
          adminCode: code!,
          ...(f.id ? { id: f.id } : {}),
          quizId: selected!.id,
          question: f.question.trim(),
          choices: f.choices.map((c) => c.trim()).filter(Boolean),
          correctIndex: f.correctIndex,
          explanation: f.explanation.trim() || null,
          position: (questions.data ?? []).length,
        },
      }),
    onSuccess: () => {
      setOpenQuestion(null);
      qc.invalidateQueries({ queryKey: ["admin-questions", selected?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delQuestion = useMutation({
    mutationFn: (id: string) => adminDeleteQuestion({ data: { adminCode: code!, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-questions", selected?.id] }),
  });

  if (!ready) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Tabilao fitantanana
      </Link>

      {!code ? (
        <p className="text-sm text-muted-foreground">
          Mila fidirana mpitantana.{" "}
          <Link to="/admin" className="font-medium text-primary">
            Ampidiro ny kaody
          </Link>
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Quiz sy fitsapana</h1>
              <p className="text-sm text-muted-foreground">Mamoròna ny fanontanian'ny fampiofanana</p>
            </div>
          </div>

          <Button
            className="mt-5 w-full"
            onClick={() => setOpenQuiz({ title: "", description: "", is_active: true })}
          >
            <Plus className="mr-2 size-4" /> Quiz vaovao
          </Button>

          <div className="mt-5 space-y-2">
            {quizzes.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              (quizzes.data ?? []).map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-card p-3"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelected(selected?.id === q.id ? null : { id: q.id, title: q.title })}
                    >
                      <p className="truncate font-medium">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.is_active ? "Navoaka" : "Voafina"}</p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Hanova ny quiz"
                      onClick={() =>
                        setOpenQuiz({
                          id: q.id,
                          title: q.title,
                          description: q.description ?? "",
                          is_active: q.is_active,
                        })
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Fafao ny quiz" onClick={() => delQuiz.mutate(q.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  {selected?.id === q.id && (
                    <div className="mt-3 border-t border-border pt-3">
                      <Button size="sm" variant="outline" onClick={() => setOpenQuestion({ ...emptyQuestion })}>
                        <Plus className="mr-2 size-4" /> Ampio fanontaniana
                      </Button>
                      <ul className="mt-3 space-y-2">
                        {(questions.data ?? []).map((item, i) => (
                          <li key={item.id} className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm">
                            <span className="min-w-0 flex-1">
                              <span className="font-medium">
                                {i + 1}. {item.question}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                Valiny marina : {item.choices[item.correct_index]}
                              </span>
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Hanova ny fanontaniana"
                              onClick={() =>
                                setOpenQuestion({
                                  id: item.id,
                                  question: item.question,
                                  choices: [...item.choices, "", "", "", ""].slice(0, Math.max(4, item.choices.length)),
                                  correctIndex: item.correct_index,
                                  explanation: item.explanation ?? "",
                                })
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Fafao ny fanontaniana"
                              onClick={() => delQuestion.mutate(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={!!openQuiz} onOpenChange={(o) => !o && setOpenQuiz(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openQuiz?.id ? "Hanova ny quiz" : "Quiz vaovao"}</DialogTitle>
          </DialogHeader>
          {openQuiz && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Lohateny</Label>
                <Input value={openQuiz.title} onChange={(e) => setOpenQuiz({ ...openQuiz, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Famaritana</Label>
                <Textarea
                  rows={2}
                  value={openQuiz.description}
                  onChange={(e) => setOpenQuiz({ ...openQuiz, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Hita amin'ny mpianatra</Label>
                <Switch
                  checked={openQuiz.is_active}
                  onCheckedChange={(v) => setOpenQuiz({ ...openQuiz, is_active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={!openQuiz?.title.trim() || saveQuiz.isPending}
              onClick={() => openQuiz && saveQuiz.mutate(openQuiz)}
            >
              {saveQuiz.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Tehirizo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openQuestion} onOpenChange={(o) => !o && setOpenQuestion(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openQuestion?.id ? "Hanova ny fanontaniana" : "Fanontaniana vaovao"}</DialogTitle>
          </DialogHeader>
          {openQuestion && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Fanontaniana</Label>
                <Textarea
                  rows={2}
                  value={openQuestion.question}
                  onChange={(e) => setOpenQuestion({ ...openQuestion, question: e.target.value })}
                />
              </div>
              {openQuestion.choices.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <Label>Valiny {i + 1}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={c}
                      onChange={(e) => {
                        const choices = [...openQuestion.choices];
                        choices[i] = e.target.value;
                        setOpenQuestion({ ...openQuestion, choices });
                      }}
                    />
                    <Button
                      type="button"
                      variant={openQuestion.correctIndex === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOpenQuestion({ ...openQuestion, correctIndex: i })}
                    >
                      Marina
                    </Button>
                  </div>
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Fanazavana (aseho aorian'ny fanitsiana)</Label>
                <Textarea
                  rows={2}
                  value={openQuestion.explanation}
                  onChange={(e) => setOpenQuestion({ ...openQuestion, explanation: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={
                !openQuestion?.question.trim() ||
                (openQuestion?.choices.filter((c) => c.trim()).length ?? 0) < 2 ||
                saveQuestion.isPending
              }
              onClick={() => openQuestion && saveQuestion.mutate(openQuestion)}
            >
              {saveQuestion.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Tehirizo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
