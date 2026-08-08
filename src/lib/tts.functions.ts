import { createServerFn } from "@tanstack/react-start";

export const speakText = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string; speed?: number }) => d)
  .handler(async ({ data }) => {
    const m = await import("./tts.server");
    return {
      audio: await m.synthesizeSpeech(data.text, { voice: data.voice, speed: data.speed }),
    };
  });
