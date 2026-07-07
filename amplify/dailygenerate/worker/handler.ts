/**
 * On-demand daily-generation worker. Async-invoked by the starter with a
 * validated { puzzleDate }. Generates every game for that date, skipping any
 * already present (idempotent — the skip-if-exists guard makes repeat/crawler
 * requests cheap no-ops), then THROWS on a total wipeout so it surfaces on the
 * Lambda Errors metric. The client detects completion by polling the puzzle
 * tables for the date — not this function's result.
 */
import { getItem } from '../../deckgen/shared/ddb';
import { generateDayFor, summarize } from '../../dailyingest/shared/generateDay';

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

/** A game already exists for the date if its deterministic-id row is present. */
async function exists(table: string, id: string): Promise<boolean> {
  return (await getItem(table, id)) !== null;
}

/** Generate the day (exported for unit testing). */
export async function runGeneration(date: string): Promise<void> {
  const results = await generateDayFor(date, env, exists);
  summarize(results, date);
}

export const handler = async (event: { puzzleDate: string }): Promise<void> => {
  await runGeneration(event.puzzleDate);
};
