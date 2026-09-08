import { useState } from "react";
import { RotateCcw, Settings2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TTS_VOICES, useTtsSettings } from "@/hooks/use-tts-settings";

/** Fikirakirana famakiana feo: feo (malagasy/frantsay), hafainganam-pandeha ary feo. */
export function TtsSettingsDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { settings, update, reset } = useTtsSettings();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="size-4" /> Feo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="size-5 text-primary" /> Fikirakirana famakiana feo
          </DialogTitle>
          <DialogDescription>
            Fidio ny feo, hafainganam-pandeha ary feon'ny famakiana ny valiny.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-2">
            <Label>Feo</Label>
            <Select value={settings.voice} onValueChange={(v) => update({ voice: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Fidio ny feo" />
              </SelectTrigger>
              <SelectContent>
                {TTS_VOICES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hafainganam-pandeha</Label>
              <span className="text-sm text-muted-foreground">{settings.speed.toFixed(2)}×</span>
            </div>
            <Slider
              value={[settings.speed]}
              min={0.5}
              max={2}
              step={0.05}
              onValueChange={([v]) => update({ speed: v ?? 1 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Feo</Label>
              <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => update({ volume: v ?? 1 })}
            />
          </div>

          <Button variant="ghost" size="sm" className="gap-2" onClick={reset}>
            <RotateCcw className="size-4" /> Averina
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
