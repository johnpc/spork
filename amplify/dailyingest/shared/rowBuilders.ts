/**
 * Pure DynamoDB row builder for generative Quiz puzzles: a Quiz row + its Answer
 * rows, PUBLISHED and stamped with `puzzleDate` so the game's daily read
 * resolves it as today's puzzle. Shapes mirror amplify/seed exactly (the play
 * engine parses these), so a validated answer set here is a playable quiz. Pure
 * → unit-tested without AWS. Island row builders live in islandRows.ts.
 */
import type { ParsedAnswer } from '../../quizgen/shared/parseAnswers';
import { axesFor } from '../../quizgen/shared/modeAxes';

export interface RowMeta {
  id: string;
  date: string; // YYYY-MM-DD (puzzleDate)
}

const stamp = (date: string) => `${date}T12:00:00.000Z`;

/** A Quiz row + its Answer rows (generative types). */
export function quizRows(
  mode: string,
  topic: string,
  categorySlug: string,
  answers: ParsedAnswer[],
  meta: RowMeta,
): { quiz: Record<string, unknown>; answers: Record<string, unknown>[] } {
  const now = stamp(meta.date);
  const axes = axesFor(mode);
  const quiz = {
    id: meta.id,
    __typename: 'Quiz',
    createdAt: now,
    updatedAt: now,
    topic,
    categorySlug,
    mode,
    inputMode: axes.inputMode,
    scoringMode: axes.scoringMode,
    status: 'PUBLISHED',
    answerCount: answers.length,
    timeLimitSeconds: 120,
    publishedAt: now,
    puzzleDate: meta.date,
  };
  const rows = answers.map((a, i) => ({
    id: `${meta.id}#${i}`,
    __typename: 'Answer',
    createdAt: now,
    updatedAt: now,
    quizId: meta.id,
    ord: i,
    promptKind: a.promptKind,
    promptValue: a.promptValue,
    display: a.display,
    accepted: JSON.stringify(a.accepted),
    options: a.options ? JSON.stringify(a.options) : undefined,
    orderIndex: a.orderIndex,
    bucket: a.bucket,
  }));
  return { quiz, answers: rows };
}
