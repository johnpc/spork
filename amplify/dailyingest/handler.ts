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
import { planFor } from './shared/dailyPlan';
import { DAILY_QUIZ_TYPES } from './shared/plan';
import * as gen from './shared/generators';
import { quizRows } from './shared/rowBuilders';
import { wordLadderRow, acrosticRow, quizzleRow } from './shared/islandRows';

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

/** UTC YYYY-MM-DD for `d` (the EventBridge fire is UTC). */
function stampFor(d: Date): string {
  return `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, '0')}-${`${d.getUTCDate()}`.padStart(2, '0')}`;
}

async function run(step: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`daily: ${step} ✓`);
  } catch (e) {
    console.error(`daily: ${step} FAILED — ${e instanceof Error ? e.message : e}`);
  }
}

export async function handler(): Promise<void> {
  const date = stampFor(new Date());
  const plan = planFor(date);
  const quizTable = env('QUIZ_TABLE');
  const answerTable = env('ANSWER_TABLE');
  const id = (g: string) => `daily-${g}-${date}-${randomUUID().slice(0, 8)}`;
  console.log(`daily ingest for ${date}: ${JSON.stringify(plan)}`);

  for (const t of DAILY_QUIZ_TYPES) {
    await run(`quiz:${t.mode}`, async () => {
      const answers = await gen.genQuizAnswers(invokeText, t.mode, plan.quizTopic);
      const { quiz, answers: rows } = quizRows(t.mode, plan.quizTopic, t.categorySlug, answers, {
        id: id(t.mode.toLowerCase()),
        date,
      });
      await putItem(quizTable, quiz);
      await batchPut(answerTable, rows);
    });
  }

  await run('steps', async () => {
    const l = await gen.genLadder(invokeText, plan.ladderLength, plan.difficulty);
    await putItem(
      env('WORD_LADDER_TABLE'),
      wordLadderRow(l, plan.difficulty, { id: id('steps'), date }),
    );
  });
  await run('acrostic', async () => {
    const a = await gen.genAcrostic(invokeText, plan.acrosticWord);
    await putItem(
      env('ACROSTIC_TABLE'),
      acrosticRow(a, plan.difficulty, { id: id('acrostic'), date }),
    );
  });
  await run('quizzle', async () => {
    const q = await gen.genQuizzle(invokeText, plan.quizzleTopic);
    await putItem(env('QUIZZLE_TABLE'), quizzleRow(q, 1000, { id: id('quizzle'), date }));
  });
  // Chess is not daily-generated — it's the curated Lichess mate set (template-
  // backed, chess.js-verified), so nothing to generate here.
  console.log('daily ingest complete');
}
