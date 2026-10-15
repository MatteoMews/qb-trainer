import { db, type QuizAttempt, type QuizQuestionType } from "./db";

export async function recordAttempt(attempt: Omit<QuizAttempt, "id" | "timestamp">): Promise<number> {
  return db.quizAttempts.add({ ...attempt, timestamp: new Date().toISOString() });
}

export function listAttempts(): Promise<QuizAttempt[]> {
  return db.quizAttempts.toArray();
}

export interface AccuracyStat {
  key: string;
  total: number;
  correct: number;
  accuracy: number;
  avgReactionTimeMs: number;
}

function summarize(attempts: QuizAttempt[], keyOf: (a: QuizAttempt) => string | undefined): AccuracyStat[] {
  const byKey = new Map<string, QuizAttempt[]>();
  for (const attempt of attempts) {
    const key = keyOf(attempt);
    if (!key) continue;
    const list = byKey.get(key) ?? [];
    list.push(attempt);
    byKey.set(key, list);
  }
  return Array.from(byKey.entries())
    .map(([key, list]) => {
      const correct = list.filter((a) => a.correct).length;
      return {
        key,
        total: list.length,
        correct,
        accuracy: correct / list.length,
        avgReactionTimeMs: list.reduce((sum, a) => sum + a.reactionTimeMs, 0) / list.length,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Trefferquote pro Coverage/Konzept/Fragetyp, für die Statistik-Ansicht und die adaptive
 *  Gewichtung der nächsten Frage (engine/adaptiveWeighting.ts). */
export async function computeStats(): Promise<{
  byCoverage: AccuracyStat[];
  byConcept: AccuracyStat[];
  byQuestionType: AccuracyStat[];
}> {
  const attempts = await listAttempts();
  return {
    byCoverage: summarize(attempts, (a) => a.coverage),
    byConcept: summarize(attempts, (a) => a.concept),
    byQuestionType: summarize(attempts, (a) => a.questionType as QuizQuestionType),
  };
}

export async function accuracyByCoverage(): Promise<Map<string, number>> {
  const { byCoverage } = await computeStats();
  return new Map(byCoverage.map((s) => [s.key, s.accuracy]));
}

export async function accuracyByConcept(): Promise<Map<string, number>> {
  const { byConcept } = await computeStats();
  return new Map(byConcept.map((s) => [s.key, s.accuracy]));
}
