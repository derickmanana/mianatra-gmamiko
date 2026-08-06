import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { fetchQuiz, sendQuizAnswers } from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/quiz_/$quizId")({
  head: () => ({
    meta: [
      { title: "Quiz de formation — Import Chine → Madagascar" },
      { name: "description", content: "Répondez au quiz et obtenez la correction détaillée du formateur." },
      { property: "og:title", content: "Quiz de formation — Import Chine → Madagascar" },
      { property: "og:description", content: "Correction détaillée et explications du formateur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPlay,
});

type Result = Awaited<ReturnType<typeof sendQuizAnswers>>;

function QuizPlay() {
  const { quizId } = Route.useParams();
  const { name, ready } = useStudentProfile();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuiz({ data: { quizId } }),
  });

  const submit = useMutation({
    mutationFn: () => sendQuizAnswers({ data: { quizId, studentName: name!, answers } }),
    onSuccess: (r) => setResult(r),
    onError: (e: Error) => toast.error(e.message),
  });

  if (ready && !name) {
    navigate({ to: "/etudiant" });
    return null;
  }

  const questions = data?.questions ?? [];
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/etudiant/quiz" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Évaluations
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Quiz introuvable.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          {data.description && <p className="text-sm text-muted-foreground">{data.description}</p>}

          {result && (
            <div
              className="mt-4 rounded-2xl border border-border bg-accent p-4 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-3xl font-bold text-primary">
                {result.score}/{result.total}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round((result.score / result.total) * 100)}% de bonnes réponses
              </p>
            </div>
          )}

          <div className="mt-5 space-y-4">
            {questions.map((q, i) => {
              const detail = result?.details.find((d) => d.id === q.id);
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-card p-4"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <p className="font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <div className="mt-3 space-y-2">
                    {q.choices.map((c, idx) => {
                      const selected = answers[q.id] === idx;
                      const isCorrect = detail && detail.correctIndex === idx;
                      const isWrong = detail && detail.givenIndex === idx && !detail.correct;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!!result}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                          className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${
                            isCorrect
                              ? "border-primary bg-accent"
                              : isWrong
                                ? "border-destructive bg-destructive/10"
                                : selected
                                  ? "border-primary bg-accent"
                                  : "border-border"
                          }`}
                        >
                          {isCorrect && <Check className="size-4 shrink-0 text-primary" />}
                          {isWrong && <X className="size-4 shrink-0 text-destructive" />}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                  {detail?.explanation && (
                    <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{detail.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          {!result ? (
            <Button
              className="mt-5 w-full"
              disabled={!allAnswered || submit.isPending}
              onClick={() => submit.mutate()}
            >
              {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Valider mes réponses
            </Button>
          ) : (
            <Button
              className="mt-5 w-full"
              variant="outline"
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              Recommencer
            </Button>
          )}
        </>
      )}
    </main>
  );
}
