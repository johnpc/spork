/**
 * Pure derivation for the daily-entry screen — the branching that decides, for a
 * game + day + fetched list, which puzzle resolves and what state to show. Split
 * out of useDailyEntry so the hook stays thin (and under the CRAP bar) and this
 * logic is unit-tested without React/react-query.
 */
import { pickDaily, pickForDate, type Dated } from './pickDaily';
import { isFuture } from './today';

export interface DailyEntryInput {
  hasGame: boolean;
  day: string;
  browsing: boolean;
  playedToday: boolean;
  isSuccess: boolean;
  data: Dated[] | undefined;
  now: Date;
}

export interface DailyEntryState {
  todays: Dated | null;
  needsGeneration: boolean;
  /** A missing day with nothing to generate (future, or today pre-ingest). */
  emptyBase: boolean;
}

/** Resolve the day's puzzle + whether it must be generated. Browsing a past day
 * needs an EXACT date match (missing → generate); today keeps pickDaily's lenient
 * most-recent fallback (so it plays before ingest stamps today). */
export function deriveDailyEntry(i: DailyEntryInput): DailyEntryState {
  const todays = i.data ? (i.browsing ? pickForDate(i.data, i.day) : pickDaily(i.data, i.day)) : null; // prettier-ignore
  const missing = i.hasGame && !i.playedToday && i.isSuccess && !todays;
  const needsGeneration = missing && i.browsing && !isFuture(i.day, i.now);
  return { todays, needsGeneration, emptyBase: missing && !needsGeneration };
}

/** Whether the list query should keep polling: only while browsing a day whose
 * puzzle hasn't landed yet (generation in flight). */
export function shouldPoll(
  browsing: boolean,
  hasGame: boolean,
  data: Dated[] | undefined,
  day: string,
): boolean {
  // prettier-ignore
  return browsing && hasGame && !(data && pickForDate(data, day));
}
