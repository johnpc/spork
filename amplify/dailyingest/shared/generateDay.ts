/**
 * The date-parameterized core of daily generation, shared by the scheduled
 * ingest (today) and the on-demand generator (a requested past date). Generates
 * one PUBLISHED puzzle per generative quiz type + each island, stamped with the
 * given puzzleDate, tolerating a single type's failure. Ids are DETERMINISTIC
 * (`daily-<game>-<date>`) so a re-run overwrites rather than duplicates; an
 * injected `exists` guard additionally skips (and so avoids the Bedrock cost of)
 * any game already generated for that date. Pure wiring — plan/generators/rows
 * are all unit-tested elsewhere.
 */
import { invokeText } from '../../deckgen/shared/bedrock';
import { putItem } from '../../deckgen/shared/ddb';
import { batchPut } from '../../quizgen/shared/batchWrite';
import { planFor, quizTopicFor } from './dailyPlan';
import { DAILY_QUIZ_TYPES } from './plan';
import * as gen from './generators';
import { quizRows } from './rowBuilders';
import { runIslands, type Exists } from './runIslands';

export type Env = (name: string) => string;

/** The scheduled ingest always generates fresh — nothing is treated as existing. */
export const NEVER_EXISTS: Exists = async () => false;

/** Run one game's generation, tolerating its failure (a bad topic shouldn't sink
 * the rest); record the outcome so the caller can detect a total wipeout. */
export async function runStep(
  results: boolean[],
  step: string,
  fn: () => Promise<void>,
): Promise<void> {
  try {
    await fn();
    console.log(`daily: ${step} ✓`);
    results.push(true);
  } catch (e) {
    console.error(`daily: ${step} FAILED — ${e instanceof Error ? e.message : e}`);
    results.push(false);
  }
}

/** Log a machine-greppable summary and THROW on a total wipeout (0 produced) so
 * it surfaces on the Lambda Errors metric instead of a silently-green run. */
export function summarize(results: boolean[], date: string): void {
  const ok = results.filter(Boolean).length;
  console.log(`daily generate complete: ${ok}/${results.length} for ${date}`);
  if (ok === 0)
    throw new Error(`daily generate produced NOTHING (0/${results.length}) for ${date}`);
}

/** Generate every game for `date`, returning the per-game success flags. */
export async function generateDayFor(
  date: string,
  env: Env,
  exists: Exists = NEVER_EXISTS,
): Promise<boolean[]> {
  const plan = planFor(date);
  const quizTable = env('QUIZ_TABLE');
  const answerTable = env('ANSWER_TABLE');
  const id = (g: string) => `daily-${g}-${date}`;
  const results: boolean[] = [];

  // Each quiz type gets its OWN topic (offset per index) so the day's quizzes
  // cover different subjects, not one topic five ways.
  for (const [i, t] of DAILY_QUIZ_TYPES.entries()) {
    await runStep(results, `quiz:${t.mode}`, async () => {
      const qid = id(t.mode.toLowerCase());
      if (await exists(quizTable, qid)) return;
      const topic = quizTopicFor(date, i);
      const answers = await gen.genQuizAnswers(invokeText, t.mode, topic);
      const { quiz, answers: rows } = quizRows(t.mode, topic, t.categorySlug, answers, {
        id: qid,
        date,
      });
      await putItem(quizTable, quiz);
      await batchPut(answerTable, rows);
    });
  }

  // Standalone islands (Steps/Acrostic/Quizzle/Connections + dictionary-derived
  // Wordle/Spelling Bee). Chess is the curated Lichess set — not daily-generated.
  await runIslands((step, fn) => runStep(results, step, fn), env, id, plan, exists);
  return results;
}
