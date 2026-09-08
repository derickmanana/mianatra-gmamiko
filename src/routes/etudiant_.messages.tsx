import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GroupChat } from "@/components/GroupChat";
import { useStudentProfile } from "@/hooks/use-student-profile";

export const Route = createFileRoute("/etudiant_/messages")({
  head: () => ({
    meta: [
      { title: "Hafatry ny vondrona — Sehatry mpianatra" },
      { name: "description", content: "Mifandraisa amin'ny mpitantana sy ireo mpianatra hafa." },
      { property: "og:title", content: "Hafatry ny vondrona — Sehatry mpianatra" },
      { property: "og:description", content: "Vondrona fifanakalozan-kevitra eo amin'ny mpianatra sy ny mpitantana." },
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
        <ArrowLeft className="size-4" /> Dosie
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Hafatry ny vondrona</h1>
      {!name ? (
        <p className="text-sm text-muted-foreground">
          Mamoronà ny mombamomba anao aloha ao amin'ny{" "}
          <Link to="/etudiant" className="font-medium text-primary">
            sehatry mpianatra
          </Link>
          .
        </p>
      ) : (
        <GroupChat authorName={name} />
      )}
    </main>
  );
}
