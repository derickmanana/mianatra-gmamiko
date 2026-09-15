import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Copy, CreditCard, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, formatAr, type PlanId } from "@/lib/billing.plans";
import { fetchMyAccount, fetchPaymentMethods, requestProofUpload, sendPaymentRequest } from "@/lib/billing.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PaywallDialog({
  studentName,
  open,
  onOpenChange,
}: {
  studentName: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: account } = useQuery({
    queryKey: ["my-account", studentName],
    enabled: open,
    queryFn: () => fetchMyAccount({ data: { studentName } }),
  });
  const { data: methods } = useQuery({ queryKey: ["payment-methods"], enabled: open, queryFn: () => fetchPaymentMethods() });

  const submit = useMutation({
    mutationFn: (proofPath: string) => sendPaymentRequest({ data: { studentName, planId: plan!, proofPath } }),
    onSuccess: () => {
      toast.success("Voaray ny porofo. Miandry fanamarinana.");
      setPlan(null);
      qc.invalidateQueries({ queryKey: ["my-account", studentName] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (file: File) => {
    if (!plan) return;
    setUploading(true);
    try {
      const { path, token } = await requestProofUpload({ data: { studentName, fileName: file.name } });
      const { error } = await supabase.storage.from("media").uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      submit.mutate(path);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const selected = PLANS.find((p) => p.id === plan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> Mila famandrihana
          </DialogTitle>
          <DialogDescription>
            {account?.freeUsed
              ? "Efa lany ny fanandramana maimaim-poana. Mividiana crédit hafatra hanohizana."
              : "Safidio ny famandrihana mety aminao."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl bg-accent/60 px-4 py-3 text-sm">
          <p className="font-semibold">Ny solim-bolako : {account?.credits ?? 0} hafatra</p>
          {account?.hasPending ? (
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-4" /> Miandry fanamarinana avy amin'ny mpitantana.
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          {PLANS.map((p) => {
            const active = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
                  active ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span>
                  <span className="block font-semibold">{p.messages} hafatra</span>
                  <span className="text-xs text-muted-foreground">
                    {"popular" in p && p.popular ? "Tena tian'ny mpianatra" : "Fanampiana IA sy famakafakana"}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-primary">{formatAr(p.amountAr)}</span>
                  {active ? <CheckCircle2 className="size-5 text-primary" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        {selected ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="size-4 text-primary" /> Alefaso {formatAr(selected.amountAr)} amin'ny :
            </p>
            {(methods ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Mbola tsy nametraka kaonty fandoavam-bola ny mpitantana. Mifandraisa aminy.
              </p>
            ) : (
              (methods ?? []).map((m) => (
                <div key={m.id} className="rounded-xl bg-muted px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {m.label} : {m.number}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Adikao"
                      onClick={() => {
                        navigator.clipboard?.writeText(m.number);
                        toast.success("Voaadika ny laharana");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  {m.holder ? <p className="text-xs text-muted-foreground">Tompon'ny kaonty : {m.holder}</p> : null}
                  {m.instructions ? <p className="mt-1 text-xs text-muted-foreground">{m.instructions}</p> : null}
                </div>
              ))
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />
            <Button
              className="w-full"
              disabled={uploading || submit.isPending || account?.hasPending}
              onClick={() => fileRef.current?.click()}
            >
              {uploading || submit.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Alefaso ny porofon'ny fandoavam-bola
            </Button>
            <p className="text-xs text-muted-foreground">
              Alefaso ny sary (capture d'écran) na PDF ny reçu. Rehefa voamarin'ny mpitantana dia hiditra ho azy ny{" "}
              {selected.messages} hafatra.
            </p>
          </div>
        ) : null}

        {account?.hasPending ? (
          <p className="rounded-2xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
            Miandry fanamarinana ny mpitantana ny kaontinao.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Détecte l'erreur de blocage renvoyée par le serveur. */
export function isPaywallError(error: unknown) {
  return error instanceof Error && error.message.includes("PAYWALL_REQUIRED");
}
