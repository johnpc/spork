/**
 * Scheduled daily-ingestion Lambda (EventBridge, once a day). Generates one
 * fresh, engine-validated, PUBLISHED puzzle for each generative game type,
 * stamped with today's puzzleDate — so every day the shelf has new games with
 * zero manual effort. The date-parameterized core is generateDayFor (shared with
 * the on-demand generator); this entry just supplies today's UTC stamp and the
 * table-name env lookup, then surfaces a total wipeout on the Errors metric.
 */
import { generateDayFor, summarize } from './shared/generateDay';

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

/** UTC YYYY-MM-DD for `d` (the EventBridge fire is UTC). */
function stampFor(d: Date): string {
  return `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, '0')}-${`${d.getUTCDate()}`.padStart(2, '0')}`;
}

export async function handler(): Promise<void> {
  const date = stampFor(new Date());
  const results = await generateDayFor(date, env);
  summarize(results, date);
}
