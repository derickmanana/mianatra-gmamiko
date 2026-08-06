import { createServerFn } from "@tanstack/react-start";

/* --------------------------- Étudiant : quiz --------------------------- */

export const fetchQuizzes = createServerFn({ method: "POST" }).handler(async () => {
  const m = await import("./learning.server");
  return m.listQuizzes(true);
});

export const fetchQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: { quizId: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    return m.getQuizForStudent(data.quizId);
  });

export const sendQuizAnswers = createServerFn({ method: "POST" })
  .inputValidator((d: { quizId: string; studentName: string; answers: Record<string, number> }) => d)
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    return m.submitQuiz(data.quizId, data.studentName, data.answers);
  });

export const fetchMyAttempts = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    return m.listMyAttempts(data.studentName);
  });

/* ---------------------- Étudiant : analyse produit ---------------------- */

export const runProductAnalysis = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      studentName: string;
      productName: string;
      platform: string;
      purchasePrice: string;
      quantity: number | null;
      notes: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    const { studentName, ...input } = data;
    return { report: await m.analyzeProduct(studentName, input) };
  });

export const fetchAnalyses = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    return m.listAnalyses(data.studentName);
  });

export const removeAnalysis = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string; id: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./learning.server");
    await m.deleteAnalysis(data.id, data.studentName);
    return { ok: true };
  });

/* ------------------------------- Admin -------------------------------- */

export const adminFetchQuizzes = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string }) => d)
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    return m.listQuizzes(false);
  });

export const adminSaveQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { adminCode: string; id?: string; title: string; description: string | null; is_active: boolean }) => d,
  )
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    return {
      id: await m.saveQuiz(data.id ?? null, {
        title: data.title,
        description: data.description,
        is_active: data.is_active,
      }),
    };
  });

export const adminDeleteQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; id: string }) => d)
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    await m.deleteQuiz(data.id);
    return { ok: true };
  });

export const adminFetchQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; quizId: string }) => d)
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    return m.listQuestions(data.quizId);
  });

export const adminSaveQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      adminCode: string;
      id?: string;
      quizId: string;
      question: string;
      choices: string[];
      correctIndex: number;
      explanation: string | null;
      position: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    await m.saveQuestion(data.id ?? null, {
      quiz_id: data.quizId,
      question: data.question,
      choices: data.choices,
      correct_index: data.correctIndex,
      explanation: data.explanation,
      position: data.position,
    });
    return { ok: true };
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; id: string }) => d)
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    await m.deleteQuestion(data.id);
    return { ok: true };
  });

export const adminFetchTracking = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string }) => d)
  .handler(async ({ data }) => {
    const c = await import("./content.server");
    c.assertAdmin(data.adminCode);
    const m = await import("./learning.server");
    return m.studentTracking();
  });
