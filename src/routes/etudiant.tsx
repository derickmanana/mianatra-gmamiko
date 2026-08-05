import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Folder, Loader2, Lock, MessageCircle, Search, UserRound } from "lucide-react";
import { fetchFolders } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentProfile } from "@/hooks/use-student-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/etudiant")({
  head: () => ({
    meta: [
      { title: "Espace étudiant — Cours & Documents" },
      { name: "description", content: "Consultez les dossiers de formation, tutoriels, images, PDF et documents." },
      { property: "og:title", content: "Espace étudiant — Cours & Documents" },
      { property: "og:description", content: "Tous vos cours et tutoriels dans une seule application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentHome,
});

function StudentHome() {
  const { name, ready, save, clear } = useStudentProfile();
  const [profileInput, setProfileInput] = useState("");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!name) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5">
        <div
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
            <UserRound className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">Créer votre profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Votre nom devient votre identifiant dans l'application.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (profileInput.trim()) save(profileInput);
            }}
          >
            <Label>Nom ou pseudo</Label>
            <Input
              autoFocus
              placeholder="Ex : Miora"
              value={profileInput}
              maxLength={60}
              onChange={(e) => setProfileInput(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={!profileInput.trim()}>
              Continuer
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return <StudentFolders studentName={name} onSwitchProfile={clear} />;
}

function StudentFolders({ studentName, onSwitchProfile }: { studentName: string; onSwitchProfile: () => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [locked, setLocked] = useState<{ id: string; name: string } | null>(null);
  const [codeValue, setCodeValue] = useState("");

  const { data, isLoading, error } = useQuery({ queryKey: ["folders"], queryFn: () => fetchFolders() });
  const folders = (data ?? []).filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const open = (f: { id: string; name: string; protected: boolean }) => {
    if (f.protected) {
      setCodeValue("");
      setLocked({ id: f.id, name: f.name });
    } else {
      navigate({ to: "/etudiant/$folderId", params: { folderId: f.id }, search: {} });
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-12 pt-5">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Accueil
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mes formations</h1>
          <p className="text-sm text-muted-foreground">
            Connecté en tant que <span className="font-medium text-foreground">{studentName}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/etudiant/messages" })}>
            <MessageCircle className="mr-1 size-4" /> Messagerie
          </Button>

          <Button variant="ghost" size="sm" onClick={onSwitchProfile}>
            Changer
          </Button>
        </div>
      </div>

      <div className="relative my-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher un dossier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Impossible de charger les dossiers.</p>
      ) : folders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun dossier disponible.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {folders.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => open(f)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Folder className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{f.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {f.protected ? (
                      <>
                        <Lock className="size-3" /> Code requis
                      </>
                    ) : (
                      "Accès libre"
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!locked} onOpenChange={(o) => !o && setLocked(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saisissez le code d'accès</DialogTitle>
            <DialogDescription>Dossier protégé : {locked?.name}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            type="password"
            inputMode="numeric"
            placeholder="Code du dossier"
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLocked(null)}>
              Annuler
            </Button>
            <Button
              disabled={!codeValue.trim()}
              onClick={() =>
                locked &&
                navigate({
                  to: "/etudiant/$folderId",
                  params: { folderId: locked.id },
                  search: { code: codeValue.trim() },
                })
              }
            >
              Ouvrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
