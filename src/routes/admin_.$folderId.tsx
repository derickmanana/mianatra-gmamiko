import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  FileType2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteRow,
  fetchFolderContent,
  fetchFolderSecurity,
  removeStudent,
  reorderRows,
  requestUpload,
  resetStudents,
  saveBlock,
  saveItem,
} from "@/lib/content.functions";
import { useAdminCode } from "@/hooks/use-admin-code";
import { ItemViewer } from "@/components/ItemViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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

type ItemType = "image" | "pdf" | "word" | "link" | "text";

const TYPES: { value: ItemType; label: string; icon: typeof ImageIcon }[] = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "word", label: "Word", icon: FileType2 },
  { value: "link", label: "Lien", icon: Link2 },
  { value: "text", label: "Texte", icon: Type },
];

export const Route = createFileRoute("/admin_/$folderId")({
  head: () => ({
    meta: [
      { title: "Gestion du dossier — Cours & Documents" },
      { name: "description", content: "Ajoutez des blocs, images, PDF, documents Word, liens et descriptions." },
      { property: "og:title", content: "Gestion du dossier — Cours & Documents" },
      { property: "og:description", content: "Organisez le contenu pédagogique de votre dossier de formation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminFolderPage,
});

function AdminFolderPage() {
  const { folderId } = Route.useParams();
  const { code, ready } = useAdminCode();
  const qc = useQueryClient();

  const [blockDialog, setBlockDialog] = useState<{ id?: string; name: string } | null>(null);
  const [itemDialog, setItemDialog] = useState<{
    id?: string;
    blockId: string;
    type: ItemType;
    title: string;
    content: string;
    url: string;
  } | null>(null);
  const [confirm, setConfirm] = useState<{ table: "blocks" | "items"; id: string; label: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-folder", folderId],
    enabled: ready && !!code,
    queryFn: () => fetchFolderContent({ data: { folderId, adminCode: code! } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-folder", folderId] });

  const blockMutation = useMutation({
    mutationFn: (v: { id?: string; name: string }) =>
      saveBlock({ data: { adminCode: code!, ...v, folderId } }),
    onSuccess: () => {
      toast.success("Bloc enregistré");
      setBlockDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const itemMutation = useMutation({
    mutationFn: (v: NonNullable<typeof itemDialog>) =>
      saveItem({
        data: {
          adminCode: code!,
          ...(v.id ? { id: v.id } : { blockId: v.blockId, type: v.type }),
          title: v.title || null,
          content: v.content || null,
          url: v.url || null,
        },
      }),
    onSuccess: () => {
      toast.success("Contenu enregistré");
      setItemDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (v: { table: "blocks" | "items"; id: string }) =>
      deleteRow({ data: { adminCode: code!, ...v } }),
    onSuccess: () => {
      toast.success("Supprimé");
      setConfirm(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (v: { table: "blocks" | "items"; ids: string[] }) =>
      reorderRows({ data: { adminCode: code!, ...v } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { path, token } = await requestUpload({ data: { adminCode: code!, fileName: file.name } });
      const { error: upErr } = await supabase.storage.from("media").uploadToSignedUrl(path, token, file);
      if (upErr) throw new Error(upErr.message);
      setItemDialog((s) => (s ? { ...s, url: path } : s));
      toast.success("Fichier téléversé");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const move = (table: "blocks" | "items", ids: string[], index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target]!, next[index]!];
    reorderMutation.mutate({ table, ids: next });
  };

  if (!ready) return null;
  if (!code)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-muted-foreground">Accès administrateur requis.</p>
        <Link to="/admin" className="font-medium text-primary">
          Saisir le code
        </Link>
      </main>
    );

  const blocks = (data?.blocks ?? []).filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.items.some((i) =>
        `${i.title ?? ""} ${i.content ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const blockIds = (data?.blocks ?? []).map((b) => b.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 pt-5">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Dossiers
      </Link>
      <h1 className="text-2xl font-bold">{data?.folder.name ?? "Dossier"}</h1>

      <SecurityPanel folderId={folderId} adminCode={code} />

      <Input
        className="mt-4"
        placeholder="Rechercher un bloc ou un contenu"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>
      ) : (
        <div className="mt-5 space-y-5">
          {blocks.map((block) => {
            const index = blockIds.indexOf(block.id);
            const itemIds = block.items.map((i) => i.id);
            return (
              <section key={block.id} className="rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center gap-1">
                  <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{block.name}</h2>
                  <Button variant="ghost" size="icon" aria-label="Monter" onClick={() => move("blocks", blockIds, index, -1)}>
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Descendre" onClick={() => move("blocks", blockIds, index, 1)}>
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Renommer" onClick={() => setBlockDialog({ id: block.id, name: block.name })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer le bloc"
                    onClick={() => setConfirm({ table: "blocks", id: block.id, label: block.name })}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>

                <div className="mt-3 space-y-3">
                  {block.items.map((item, i) => (
                    <div key={item.id}>
                      <ItemViewer item={item} />
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Monter" onClick={() => move("items", itemIds, i, -1)}>
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Descendre" onClick={() => move("items", itemIds, i, 1)}>
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Modifier"
                          onClick={() =>
                            setItemDialog({
                              id: item.id,
                              blockId: block.id,
                              type: item.type,
                              title: item.title ?? "",
                              content: item.content ?? "",
                              url: item.type === "link" ? (item.url ?? "") : "",
                            })
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Supprimer"
                          onClick={() => setConfirm({ table: "items", id: item.id, label: item.title ?? "ce contenu" })}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <Button
                      key={t.value}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setItemDialog({ blockId: block.id, type: t.value, title: "", content: "", url: "" })
                      }
                    >
                      <t.icon className="mr-1 size-4" /> {t.label}
                    </Button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Button
        className="fixed bottom-6 left-1/2 h-14 -translate-x-1/2 rounded-full px-6 text-base"
        style={{ boxShadow: "var(--shadow-card)" }}
        onClick={() => setBlockDialog({ name: "" })}
      >
        <Plus className="mr-1 size-5" /> Nouveau bloc
      </Button>

      <Dialog open={!!blockDialog} onOpenChange={(o) => !o && setBlockDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blockDialog?.id ? "Renommer le bloc" : "Créer un bloc"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Ex : Tutoriel 1"
            value={blockDialog?.name ?? ""}
            onChange={(e) => setBlockDialog((s) => (s ? { ...s, name: e.target.value } : s))}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBlockDialog(null)}>
              Annuler
            </Button>
            <Button
              disabled={!blockDialog?.name.trim() || blockMutation.isPending}
              onClick={() =>
                blockDialog &&
                blockMutation.mutate(
                  blockDialog.id ? { id: blockDialog.id, name: blockDialog.name.trim() } : { name: blockDialog.name.trim() },
                )
              }
            >
              {blockMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!itemDialog} onOpenChange={(o) => !o && setItemDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {itemDialog?.id ? "Modifier le contenu" : `Ajouter : ${TYPES.find((t) => t.value === itemDialog?.type)?.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Titre (facultatif)</Label>
              <Input
                value={itemDialog?.title ?? ""}
                onChange={(e) => setItemDialog((s) => (s ? { ...s, title: e.target.value } : s))}
              />
            </div>

            {itemDialog && ["image", "pdf", "word"].includes(itemDialog.type) && !itemDialog.id ? (
              <div className="space-y-1.5">
                <Label>Fichier</Label>
                <Input
                  type="file"
                  accept={
                    itemDialog.type === "image"
                      ? "image/*"
                      : itemDialog.type === "pdf"
                        ? "application/pdf"
                        : ".doc,.docx"
                  }
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                  }}
                />
                {uploading ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Téléversement…
                  </p>
                ) : itemDialog.url ? (
                  <p className="text-sm font-medium text-primary">Fichier prêt ✓</p>
                ) : null}
              </div>
            ) : null}

            {itemDialog?.type === "link" ? (
              <div className="space-y-1.5">
                <Label>Adresse du lien</Label>
                <Input
                  placeholder="https://..."
                  value={itemDialog.url}
                  onChange={(e) => setItemDialog((s) => (s ? { ...s, url: e.target.value } : s))}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label>Description / texte</Label>
              <Textarea
                rows={8}
                placeholder="Explications, cours, notes, astuces…"
                value={itemDialog?.content ?? ""}
                onChange={(e) => setItemDialog((s) => (s ? { ...s, content: e.target.value } : s))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemDialog(null)}>
              Annuler
            </Button>
            <Button
              disabled={
                itemMutation.isPending ||
                uploading ||
                (!!itemDialog &&
                  !itemDialog.id &&
                  ["image", "pdf", "word"].includes(itemDialog.type) &&
                  !itemDialog.url) ||
                (itemDialog?.type === "link" && !itemDialog.url.trim())
              }
              onClick={() => itemDialog && itemMutation.mutate(itemDialog)}
            >
              {itemMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {confirm?.label} » ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirm && deleteMutation.mutate({ table: confirm.table, id: confirm.id })}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function SecurityPanel({ folderId, adminCode }: { folderId: string; adminCode: string }) {
  const qc = useQueryClient();
  const [showList, setShowList] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const { data } = useQuery({
    queryKey: ["folder-security", folderId],
    queryFn: () => fetchFolderSecurity({ data: { adminCode, folderId } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["folder-security", folderId] });

  const removeOne = useMutation({
    mutationFn: (id: string) => removeStudent({ data: { adminCode, id } }),
    onSuccess: () => {
      toast.success("Étudiant retiré, place libérée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetAll = useMutation({
    mutationFn: () => resetStudents({ data: { adminCode, folderId } }),
    onSuccess: () => {
      toast.success("Compteur réinitialisé");
      setConfirmReset(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!data) return null;
  if (!data.accessCode)
    return <p className="text-sm text-muted-foreground">Dossier public — aucun code d'accès.</p>;

  return (
    <section className="mt-3 rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sécurité du dossier</h2>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Code</dt>
          <dd className="font-semibold">{data.accessCode}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Limite</dt>
          <dd className="font-semibold">{data.maxUsers === null ? "Illimitée" : `${data.maxUsers} étudiants`}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Déjà inscrits</dt>
          <dd className="font-semibold">{data.used}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Places restantes</dt>
          <dd className="font-semibold">{data.remaining === null ? "—" : data.remaining}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowList(true)}>
          Voir la liste des étudiants
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
          Réinitialiser le compteur
        </Button>
      </div>

      <Dialog open={showList} onOpenChange={setShowList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Étudiants autorisés ({data.students.length})</DialogTitle>
          </DialogHeader>
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
            {data.students.length === 0 ? (
              <li className="text-sm text-muted-foreground">Aucun étudiant n'a encore activé ce dossier.</li>
            ) : (
              data.students.map((st) => (
                <li key={st.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{st.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(st.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Retirer" onClick={() => removeOne.mutate(st.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser la liste des étudiants ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les étudiants devront saisir à nouveau le code pour accéder au dossier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => resetAll.mutate()}>Réinitialiser</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
