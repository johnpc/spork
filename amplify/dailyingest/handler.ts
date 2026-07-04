/**
 * Scheduled daily-ingestion Lambda (EventBridge, once a day). Generates one
 * fresh, engine-validated, PUBLISHED puzzle for each generative game type,
 * stamped with today's puzzleDate — so every day the shelf has new games with
 * zero manual effort. Idempotent per date (deterministic ids). Thin: the plan,
 * generators, validators, and row builders are all pure + unit-tested; this just
 * wires Bedrock + DynamoDB and tolerates a single type failing without aborting
 * the rest.
 */
import { randomUUID } from 'node:crypto';
import { invokeText } from '../deckgen/shared/bedrock';
import { putItem } from '../deckgen/shared/ddb';
import { batchPut } from '../quizgen/shared/batchWrite';
import { planFor, quizTopicFor } from './shared/dailyPlan';
import { DAILY_QUIZ_TYPES } from './shared/plan';
import * as gen from './shared/generators';
import { quizRows } from './shared/rowBuilders';
import { runIslands } from './shared/runIslands';

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

/** UTC YYYY-MM-DD for `d` (the EventBridge fire is UTC). */
function stampFor(d: Date): string {
  return `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, '0')}-${`${d.getUTCDate()}`.padStart(2, '0')}`;
}

/** Run one game's generation, tolerating its failure (a bad topic shouldn't sink
 * the rest), and record the outcome in `results` so the handler can detect a
 * total wipeout. */
async function run(results: boolean[], step: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`daily: ${step} ✓`);
    results.push(true);
  } catch (e) {
    console.error(`daily: ${step} FAILED — ${e instanceof Error ? e.message : e}`);
    results.push(false);
  }
}

/** Log a machine-greppable summary and THROW if nothing was produced — a total
 * wipeout surfaces on the Lambda Errors metric (alarmable) instead of a
 * silently-green run that left the shelf stale. Exported for unit testing. */
export function summarize(results: boolean[], date: string): void {
  const ok = results.filter(Boolean).length;
  console.log(`daily ingest complete: ${ok}/${results.length} generated`);
  if (ok === 0) throw new Error(`daily ingest produced NOTHING (0/${results.length}) for ${date}`);
}

export async function handler(): Promise<void> {
  const date = stampFor(new Date());
  const plan = planFor(date);
  const quizTable = env('QUIZ_TABLE');
  const answerTable = env('ANSWER_TABLE');
  const id = (g: string) => `daily-${g}-${date}-${randomUUID().slice(0, 8)}`;
  console.log(`daily ingest for ${date}: ${JSON.stringify(plan)}`);
  const results: boolean[] = [];

  // Each quiz type gets its OWN topic (offset per index) so the day's five
  // quizzes cover five different subjects, not one topic five ways.
  for (const [i, t] of DAILY_QUIZ_TYPES.entries()) {
    await run(results, `quiz:${t.mode}`, async () => {
      const topic = quizTopicFor(date, i);
      const answers = await gen.genQuizAnswers(invokeText, t.mode, topic);
      const { quiz, answers: rows } = quizRows(t.mode, topic, t.categorySlug, answers, {
        id: id(t.mode.toLowerCase()),
        date,
      });
      await putItem(quizTable, quiz);
      await batchPut(answerTable, rows);
    });
  }

  // The standalone islands (Steps/Acrostic/Quizzle/Connections + the dictionary-
  // derived Wordle/Spelling Bee). Chess is not daily-generated — it's the curated
  // Lichess mate set (template-backed, chess.js-verified).
  await runIslands((step, fn) => run(results, step, fn), env, id, plan);
  summarize(results, date);
}
