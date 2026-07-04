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

export async function runIslands(run: Run, env: Env, id: Id, plan: DailyPlan): Promise<void> {
  const { date } = plan;
  await run('steps', async () => {
    const l = await gen.genLadder(invokeText, plan.ladderLength, plan.difficulty);
    await putItem(env('WORD_LADDER_TABLE'), wordLadderRow(l, plan.difficulty, { id: id('steps'), date })); // prettier-ignore
  });
  await run('acrostic', async () => {
    const a = await gen.genAcrostic(invokeText, plan.acrosticWord);
    await putItem(env('ACROSTIC_TABLE'), acrosticRow(a, plan.difficulty, { id: id('acrostic'), date })); // prettier-ignore
  });
  await run('quizzle', async () => {
    const q = await gen.genQuizzle(invokeText, plan.quizzleTopic);
    await putItem(env('QUIZZLE_TABLE'), quizzleRow(q, 1000, { id: id('quizzle'), date }));
  });
  await run('connections', async () => {
    const c = await gen.genConnections(invokeText);
    await putItem(env('CONNECTIONS_TABLE'), connectionsRow(c, { id: id('connections'), date }));
  });
  const d = dayNumber(date);
  await run('wordle', async () => {
    await putItem(env('WORDLE_TABLE'), wordleRow(rotate(seedWordleAnswers, d), { id: id('wordle'), date })); // prettier-ignore
  });
  await run('spellingbee', async () => {
    await putItem(env('SPELLING_BEE_TABLE'), spellingBeeRow(rotate(seedBees, d), { id: id('spellingbee'), date })); // prettier-ignore
  });
}
