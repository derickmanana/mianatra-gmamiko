import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GMAMIKO33" },
      {
        name: "description",
        content:
          "Application de gestion et consultation de cours : dossiers, tutoriels, images, PDF, documents Word et liens, pour administrateurs et étudiants.",
      },
      { property: "og:title", content: "GMAMIKO33" },
      {
        property: "og:description",
        content: "Application de gestion et consultation de cours : dossiers, tutoriels, images, PDF, documents Word et liens, pour administrateurs et étudiants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div
        className="mb-8 flex size-20 items-center justify-center rounded-3xl text-primary-foreground"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
      >
        <BookOpen className="size-10" />
      </div>
      <h1 className="text-center text-3xl font-bold tracking-tight text-foreground">Cours & Documents</h1>
      <p className="mt-3 max-w-sm text-center text-muted-foreground">
        Gérez et consultez vos formations : dossiers, tutoriels, images, PDF, documents et liens.
      </p>

      <div className="mt-10 grid w-full max-w-sm gap-4">
        <Link
          to="/admin"
          className="flex items-center gap-4 rounded-3xl bg-primary px-5 py-5 text-primary-foreground transition-transform active:scale-[0.98]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <ShieldCheck className="size-7 shrink-0" />
          <span>
            <span className="block text-lg font-semibold">Administrateur</span>
            <span className="block text-sm opacity-80">Créer et gérer les contenus</span>
          </span>
        </Link>
        <Link
          to="/etudiant"
          className="flex items-center gap-4 rounded-3xl border border-border bg-card px-5 py-5 text-foreground transition-transform active:scale-[0.98]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <GraduationCap className="size-7 shrink-0 text-primary" />
          <span>
            <span className="block text-lg font-semibold">Étudiant</span>
            <span className="block text-sm text-muted-foreground">Consulter les cours</span>
          </span>
        </Link>
      </div>
    </main>
  );
}
