/**
 * Generates the standalone-island puzzles for a day and writes each to its table.
 * Split from the handler to keep it thin. Two kinds of island:
 *  - LLM-generated (Steps, Acrostic, Quizzle, Connections) — validated then persisted.
 *  - Dictionary-derived (Wordle, Spelling Bee) — an answer word / valid-word board an
 *    LLM can't reliably enumerate, so we rotate the curated seed pool by day-number
 *    (deterministic, zero Bedrock cost).
 * Chess is not here: it's the curated Lichess mate set (template-backed).
 */
import { invokeText } from '../../deckgen/shared/bedrock';
import { putItem } from '../../deckgen/shared/ddb';
import { dayNumber, rotate, type DailyPlan } from './dailyPlan';
import * as gen from './generators';
import { wordLadderRow, acrosticRow, quizzleRow } from './islandRows';
import { wordleRow, connectionsRow, spellingBeeRow } from './nytRows';
import { seedWordleAnswers } from '../../seed/fixtures/wordle';
import { seedBees } from '../../seed/fixtures/spellingBee';

type Run = (step: string, fn: () => Promise<void>) => Promise<void>;
type Env = (name: string) => string;
type Id = (game: string) => string;
/** Returns true if a game's row already exists for the date (skip regeneration). */
export type Exists = (table: string, id: string) => Promise<boolean>;

const NEVER: Exists = async () => false;

export async function runIslands(
  run: Run,
  env: Env,
  id: Id,
  plan: DailyPlan,
  exists: Exists = NEVER,
): Promise<void> {
  const { date } = plan;
  await run('steps', async () => {
    const table = env('WORD_LADDER_TABLE');
    if (await exists(table, id('steps'))) return;
    const l = await gen.genLadder(invokeText, plan.ladderLength, plan.difficulty);
    await putItem(table, wordLadderRow(l, plan.difficulty, { id: id('steps'), date }));
  });
  await run('acrostic', async () => {
    const table = env('ACROSTIC_TABLE');
    if (await exists(table, id('acrostic'))) return;
    const a = await gen.genAcrostic(invokeText, plan.acrosticWord);
    await putItem(table, acrosticRow(a, plan.difficulty, { id: id('acrostic'), date }));
  });
  await run('quizzle', async () => {
    const table = env('QUIZZLE_TABLE');
    if (await exists(table, id('quizzle'))) return;
    const q = await gen.genQuizzle(invokeText, plan.quizzleTopic);
    await putItem(table, quizzleRow(q, 1000, { id: id('quizzle'), date }));
  });
  await run('connections', async () => {
    const table = env('CONNECTIONS_TABLE');
    if (await exists(table, id('connections'))) return;
    const c = await gen.genConnections(invokeText);
    await putItem(table, connectionsRow(c, { id: id('connections'), date }));
  });
  const d = dayNumber(date);
  await run('wordle', async () => {
    const table = env('WORDLE_TABLE');
    if (await exists(table, id('wordle'))) return;
    await putItem(table, wordleRow(rotate(seedWordleAnswers, d), { id: id('wordle'), date }));
  });
  await run('spellingbee', async () => {
    const table = env('SPELLING_BEE_TABLE');
    if (await exists(table, id('spellingbee'))) return;
    await putItem(table, spellingBeeRow(rotate(seedBees, d), { id: id('spellingbee'), date }));
  });
}
