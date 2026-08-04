import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GroupChat } from "@/components/GroupChat";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/messages")({
  head: () => ({
    meta: [
      { title: "Messagerie du groupe — Espace étudiant" },
      { name: "description", content: "Échangez avec l'administrateur et les autres étudiants." },
      { property: "og:title", content: "Messagerie du groupe — Espace étudiant" },
      { property: "og:description", content: "Groupe de discussion entre étudiants et administrateur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentMessages,
});

function StudentMessages() {
  const { name, ready } = useStudentProfile();
  if (!ready) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-8 pt-5">
      <Link to="/etudiant" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Dossiers
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Messagerie du groupe</h1>
      {!name ? (
        <p className="text-sm text-muted-foreground">
          Créez d'abord votre profil dans{" "}
          <Link to="/etudiant" className="font-medium text-primary">
            l'espace étudiant
          </Link>
          .
        </p>
      ) : (
        <GroupChat authorName={name} />
      )}
    </main>
  );
}
