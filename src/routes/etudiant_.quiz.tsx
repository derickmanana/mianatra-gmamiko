import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { fetchMyAttempts, fetchQuizzes } from "@/lib/learning.functions";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/quiz")({
  head: () => ({
    meta: [
      { title: "Fanadinana — Fampiofanana fanafarana Shina → Madagasikara" },
      { name: "description", content: "Andramo ny fahalalanao momba ny fanafarana avy any Shina ho any Madagasikara." },
      { property: "og:title", content: "Fanadinana" },
      { property: "og:description", content: "Fanadinan'ny fampiofanana fanafarana Shina → Madagasikara, misy valiny." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizList,
});

function QuizList() {
  const { name, ready } = useStudentProfile();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["quizzes"], queryFn: () => fetchQuizzes() });
  const { data: attempts } = useQuery({
    queryKey: ["my-attempts", name],
    enabled: ready && !!name,
    queryFn: () => fetchMyAttempts({ data: { studentName: name! } }),
  });

  if (ready && !name) {
    navigate({ to: "/etudiant" });
    return null;
  }

  const best = new Map<string, number>();
  for (const a of attempts ?? []) {
    const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
    best.set(a.quizId, Math.max(best.get(a.quizId) ?? 0, pct));
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/etudiant" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Sehatry mpianatra
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
          <GraduationCap className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Fanadinana</h1>
          <p className="text-sm text-muted-foreground">Diniho ny fahalalanao</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Mbola tsy misy fanadinana azo atao amin'izao.
          </p>
        ) : (
          (data ?? []).map((q) => (
            <Link
              key={q.id}
              to="/etudiant/quiz/$quizId"
              params={{ quizId: q.id }}
              className="block rounded-2xl border border-border bg-card p-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="font-semibold">{q.title}</p>
              {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
              {best.has(q.id) && (
                <p className="mt-1 text-xs font-medium text-primary">Naoty tsara indrindra : {best.get(q.id)}%</p>
              )}
            </Link>
          ))
        )}
      </div>

      {(attempts ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Tantara</h2>
          <ul className="space-y-2">
            {(attempts ?? []).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="min-w-0 truncate">{a.title}</span>
                <span className="shrink-0 font-medium">
                  {a.score}/{a.total} · {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
