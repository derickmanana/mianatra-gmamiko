import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GroupChat } from "@/components/GroupChat";
import { useAdminCode } from "@/hooks/use-admin-code";

export const Route = createFileRoute("/admin_/messages")({
  head: () => ({
    meta: [
      { title: "Messagerie du groupe — Administration" },
      { name: "description", content: "Discutez avec les étudiants depuis l'espace administrateur." },
      { property: "og:title", content: "Messagerie du groupe — Administration" },
      { property: "og:description", content: "Groupe de discussion entre l'administrateur et les étudiants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  const { code, ready } = useAdminCode();
  if (!ready) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-8 pt-5">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Tableau de bord
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Messagerie du groupe</h1>
      {!code ? (
        <p className="text-sm text-muted-foreground">
          Accès administrateur requis.{" "}
          <Link to="/admin" className="font-medium text-primary">
            Saisir le code
          </Link>
        </p>
      ) : (
        <GroupChat authorName="Administrateur" adminCode={code} />
      )}
    </main>
  );
}
