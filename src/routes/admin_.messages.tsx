import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GroupChat } from "@/components/GroupChat";
import { useAdminCode } from "@/hooks/use-admin-code";

export const Route = createFileRoute("/admin_/messages")({
  head: () => ({
    meta: [
      { title: "Hafatry ny vondrona — Fitantanana" },
      { name: "description", content: "Mifandraisa amin'ny mpianatra avy amin'ny fitantanana." },
      { property: "og:title", content: "Hafatry ny vondrona — Fitantanana" },
      { property: "og:description", content: "Vondrona resadresaka misy ny mpitantana sy ny mpianatra." },
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
        <ArrowLeft className="size-4" /> Tabilao fitantanana
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Hafatry ny vondrona</h1>
      {!code ? (
        <p className="text-sm text-muted-foreground">
          Mila fidirana mpitantana.{" "}
          <Link to="/admin" className="font-medium text-primary">
            Ampidiro ny kaody
          </Link>
        </p>
      ) : (
        <GroupChat authorName="Mpitantana" adminCode={code} />
      )}
    </main>
  );
}
