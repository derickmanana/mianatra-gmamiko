import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "install_prompt_dismissed";

/** Invite à installer l'application (Android : bannière native, iPhone : instructions). */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua)) {
      setIosHint(true);
      setHidden(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const close = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Installer l'application</p>
        {iosHint ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Appuyez sur <Share className="size-3" /> puis « Sur l'écran d'accueil ».
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Accès rapide et utilisation hors connexion.</p>
        )}
      </div>
      {!iosHint && (
        <Button
          size="sm"
          onClick={async () => {
            if (!deferred) return;
            await deferred.prompt();
            await deferred.userChoice;
            close();
          }}
        >
          Installer
        </Button>
      )}
      <Button variant="ghost" size="icon" aria-label="Fermer" onClick={close}>
        <X className="size-4" />
      </Button>
    </div>
  );
}
