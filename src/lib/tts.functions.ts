import { createServerFn } from "@tanstack/react-start";

export const speakText = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./tts.server");
    return { audio: await m.synthesizeSpeech(data.text) };
  });
