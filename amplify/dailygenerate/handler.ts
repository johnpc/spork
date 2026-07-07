/**
 * generateDailyPuzzles STARTER (custom-mutation resolver). Thin + fast: validate
 * the requested date is a real past-or-today stamp, async-invoke the worker (the
 * long generation), and return { date, started: true } immediately — the job
 * outruns the AppSync resolver window. Generation is idempotent in the worker, so
 * a repeat call for an already-generated (or in-flight) day is a cheap no-op. The
 * client polls the puzzle tables by puzzleDate to detect completion.
 */
import { assertPastOrToday } from './validateDate';
import { invokeWorker } from './invokeWorker';
import type { Schema } from '../data/resource';

type Args = Schema['generateDailyPuzzles']['args'];

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

export const handler: Schema['generateDailyPuzzles']['functionHandler'] = async (event) => {
  const { puzzleDate } = event.arguments as Args;
  assertPastOrToday(puzzleDate, new Date());
  await invokeWorker(env('WORKER_FUNCTION_NAME'), puzzleDate);
  return { date: puzzleDate, started: true };
};
