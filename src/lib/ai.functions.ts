import { createServerFn } from "@tanstack/react-start";

export const fetchConversations = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./ai.server");
    return m.listConversations(data.studentName);
  });

export const newConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./ai.server");
    return { id: await m.createConversation(data.studentName) };
  });

export const removeConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string; id: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./ai.server");
    await m.deleteConversation(data.id, data.studentName);
    return { ok: true };
  });

export const fetchConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string; id: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./ai.server");
    return m.listAiMessages(data.id, data.studentName);
  });

export const askAi = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string; id: string; question: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./ai.server");
    return { answer: await m.askAssistant(data.id, data.studentName, data.question) };
  });
