import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { adminFetchTracking } from "@/lib/learning.functions";
import { useAdminCode } from "@/hooks/use-admin-code";

export const Route = createFileRoute("/admin_/suivi")({
  head: () => ({
    meta: [
      { title: "Fanaraha-maso mpianatra — Fitantanana" },
      { name: "description", content: "Araho ny hetsiky ny mpianatra: quiz, fandalinana, resadresaka ary hafatra." },
      { property: "og:title", content: "Fanaraha-maso mpianatra — Fitantanana" },
      { property: "og:description", content: "Tabilao fanaraha-maso ny fandrosoan'ny mpianatra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSuivi,
});

function AdminSuivi() {
  const { code, ready } = useAdminCode();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tracking"],
    enabled: ready && !!code,
    queryFn: () => adminFetchTracking({ data: { adminCode: code! } }),
  });

  if (!ready) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-12 pt-5">
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
              <Users className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fanaraha-maso mpianatra</h1>
              <p className="text-sm text-muted-foreground">Fandrosoana sy hetsika</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Mpianatra", value: data?.totals.students ?? 0 },
                  { label: "Quiz natao", value: data?.totals.attempts ?? 0 },
                  { label: "Fandalinana", value: data?.totals.analyses ?? 0 },
                  { label: "Resadresaka IA", value: data?.totals.conversations ?? 0 },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card p-3 text-center"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <p className="text-2xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3">Mpianatra</th>
                      <th className="p-3">Dosie</th>
                      <th className="p-3">Quiz</th>
                      <th className="p-3">Antonony</th>
                      <th className="p-3">Fandalinana</th>
                      <th className="p-3">IA</th>
                      <th className="p-3">Hafatra</th>
                      <th className="p-3">Hetsika farany</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.rows ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">
                          Tsy misy hetsika ankehitriny.
                        </td>
                      </tr>
                    ) : (
                      (data?.rows ?? []).map((r) => (
                        <tr key={r.name} className="border-t border-border">
                          <td className="p-3 font-medium">{r.name}</td>
                          <td className="p-3">{r.folders}</td>
                          <td className="p-3">{r.attempts}</td>
                          <td className="p-3">{r.avgScore === null ? "—" : `${r.avgScore}%`}</td>
                          <td className="p-3">{r.analyses}</td>
                          <td className="p-3">{r.conversations}</td>
                          <td className="p-3">{r.messages}</td>
                          <td className="p-3 text-muted-foreground">
                            {r.lastActivity ? new Date(r.lastActivity).toLocaleDateString("fr-FR") : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
