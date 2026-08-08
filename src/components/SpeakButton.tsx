import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { speakText } from "@/lib/tts.functions";
import { Button } from "@/components/ui/button";
import { useTtsSettings } from "@/hooks/use-tts-settings";

/** Bouton de lecture audio (TTS) d'une réponse de l'assistant. */
export function SpeakButton({ text }: { text: string }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Record<string, string>>({});
  const { settings } = useTtsSettings();

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Applique le volume en direct pendant la lecture.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = settings.volume;
  }, [settings.volume]);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  };

  const play = async () => {
    if (playing) return stop();
    try {
      setLoading(true);
      const key = `${settings.voice}|${settings.speed}`;
      const base64 =
        cacheRef.current[key] ??
        (await speakText({ data: { text, voice: settings.voice, speed: settings.speed } })).audio;
      cacheRef.current[key] = base64;
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      audio.volume = settings.volume;
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lecture audio impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mt-1 h-7 gap-1.5 px-2 text-xs text-muted-foreground"
      onClick={play}
      disabled={loading}
      aria-label={playing ? "Arrêter la lecture" : "Écouter la réponse"}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : playing ? (
        <Square className="size-3.5" />
      ) : (
        <Volume2 className="size-3.5" />
      )}
      {playing ? "Arrêter" : "Écouter"}
    </Button>
  );
}
