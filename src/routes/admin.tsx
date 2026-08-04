import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Folder,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { checkAdminCode, deleteRow, fetchFolders, saveFolder } from "@/lib/content.functions";
import { useAdminCode } from "@/hooks/use-admin-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace administrateur — Cours & Documents" },
      { name: "description", content: "Créez et organisez les dossiers, blocs et contenus de vos formations." },
      { property: "og:title", content: "Espace administrateur — Cours & Documents" },
      { property: "og:description", content: "Gestion des dossiers, blocs, images, PDF, documents et liens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { code, ready, save, clear } = useAdminCode();
  if (!ready) return <FullLoader />;
  if (!code) return <CodeGate onValid={save} />;
  return <Dashboard adminCode={code} onLogout={clear} />;
}

function FullLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  );
}

function CodeGate({ onValid }: { onValid: (code: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (c: string) => checkAdminCode({ data: { code: c } }),
    onSuccess: (_d, c) => onValid(c),
    onError: () => setError("Code administrateur incorrect."),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Retour
      </Link>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-xl font-semibold">Accès administrateur</h1>
        <p className="mt-1 text-sm text-muted-foreground">Saisissez votre code d'accès.</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            mutation.mutate(value.trim());
          }}
        >
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="Code administrateur"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={mutation.isPending || !value.trim()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Entrer"}
          </Button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({ adminCode, onLogout }: { adminCode: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id?: string; name: string; accessCode: string; maxUsers: string } | null>(
    null,
  );
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["folders"], queryFn: () => fetchFolders() });

  const saveMutation = useMutation({
    mutationFn: (v: { id?: string; name: string; accessCode: string; maxUsers: number | null }) =>
      saveFolder({ data: { adminCode, ...v } }),

    onSuccess: () => {
      toast.success("Dossier enregistré");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["folders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRow({ data: { adminCode, table: "folders", id } }),
    onSuccess: () => {
      toast.success("Dossier supprimé");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["folders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const folders = (data ?? []).filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 pt-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Gérez vos dossiers de formation</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Quitter
        </Button>
      </header>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher un dossier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <FullLoader />
      ) : folders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun dossier pour le moment.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {folders.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => navigate({ to: "/admin/$folderId", params: { folderId: f.id } })}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Folder className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{f.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {f.protected ? (
                      <>
                        <Lock className="size-3" /> Protégé
                      </>
                    ) : (
                      "Public"
                    )}
                  </span>
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Modifier"
                onClick={() => setEditing({ id: f.id, name: f.name, accessCode: "" })}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Supprimer"
                onClick={() => setToDelete({ id: f.id, name: f.name })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        className="fixed bottom-6 left-1/2 h-14 -translate-x-1/2 rounded-full px-6 text-base"
        style={{ boxShadow: "var(--shadow-card)" }}
        onClick={() => setEditing({ name: "", accessCode: "" })}
      >
        <Plus className="mr-1 size-5" /> Nouveau dossier
      </Button>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le dossier" : "Créer un dossier"}</DialogTitle>
            <DialogDescription>
              Laissez le code vide pour rendre le dossier public.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom du dossier</Label>
              <Input
                autoFocus
                value={editing?.name ?? ""}
                placeholder="Ex : Pinduoduo"
                onChange={(e) => setEditing((s) => (s ? { ...s, name: e.target.value } : s))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Code d'accès (facultatif)</Label>
              <Input
                inputMode="numeric"
                value={editing?.accessCode ?? ""}
                placeholder="Ex : 123456"
                onChange={(e) => setEditing((s) => (s ? { ...s, accessCode: e.target.value } : s))}
              />
            </div>
            {editing?.accessCode.trim() ? (
              <div className="space-y-1.5">
                <Label>Nombre maximum d'étudiants (facultatif)</Label>
                <Input
                  inputMode="numeric"
                  value={editing?.maxUsers ?? ""}
                  placeholder="Ex : 12"
                  onChange={(e) =>
                    setEditing((s) => (s ? { ...s, maxUsers: e.target.value.replace(/[^0-9]/g, "") } : s))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour un nombre illimité d'étudiants.
                </p>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button
              disabled={!editing?.name.trim() || saveMutation.isPending}
              onClick={() =>
                editing &&
                saveMutation.mutate({
                  ...(editing.id ? { id: editing.id } : {}),
                  name: editing.name.trim(),
                  accessCode: editing.accessCode.trim(),
                  maxUsers: editing.maxUsers.trim() ? Number(editing.maxUsers.trim()) : null,
                })
              }
            >

              {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {toDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les blocs et contenus de ce dossier seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
