import { useCallback, useEffect, useState } from "react";

export type TtsSettings = {
  voice: string;
  speed: number;
  volume: number;
};

export const TTS_VOICES = [
  { id: "alloy", label: "Alloy — neutre (malgache/français)" },
  { id: "verse", label: "Verse — chaleureuse (malgache)" },
  { id: "sage", label: "Sage — posée (malgache)" },
  { id: "coral", label: "Coral — féminine (français)" },
  { id: "onyx", label: "Onyx — grave (français)" },
  { id: "nova", label: "Nova — dynamique (français)" },
] as const;

export const DEFAULT_TTS: TtsSettings = { voice: "alloy", speed: 1, volume: 1 };

const KEY = "tts-settings";

function read(): TtsSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_TTS;
    const p = JSON.parse(raw) as Partial<TtsSettings>;
    return {
      voice: typeof p.voice === "string" ? p.voice : DEFAULT_TTS.voice,
      speed: typeof p.speed === "number" ? Math.min(2, Math.max(0.5, p.speed)) : DEFAULT_TTS.speed,
      volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : DEFAULT_TTS.volume,
    };
  } catch {
    return DEFAULT_TTS;
  }
}

const listeners = new Set<(s: TtsSettings) => void>();

/** Préférences de lecture audio (voix, vitesse, volume) mémorisées sur l'appareil. */
export function useTtsSettings() {
  const [settings, setSettings] = useState<TtsSettings>(DEFAULT_TTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(read());
    setReady(true);
    const fn = (s: TtsSettings) => setSettings(s);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const update = useCallback((patch: Partial<TtsSettings>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l(next));
  }, []);

  const reset = useCallback(() => {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_TTS));
    listeners.forEach((l) => l(DEFAULT_TTS));
  }, []);

  return { settings, ready, update, reset };
}
