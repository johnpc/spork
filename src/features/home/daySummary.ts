import { scoreBar } from '../../games/shared/daily/shareResult';
import type { DailyResult } from '../../games/shared/daily/dailyStore';

/**
 * Build the spoiler-free "share my whole day" scorecard — the multi-game capstone
 * to the per-game share. One line per FINISHED daily game (emoji + name + score
 * bar), a header with the date and done/total tally, and the link. Pure over the
 * game list + a result lookup, so it's unit-tested and reused by Home.
 */
export interface DaySummaryGame {
  name: string;
  emoji: string;
  dailyKey?: string;
}

const SITE = 'spork.jpc.io';

/** The scorecard text, or '' if nothing is finished yet (nothing to brag about). */
export function buildDaySummaryText(
  games: DaySummaryGame[],
  resultFor: (dailyKey?: string) => DailyResult | null,
  date: string,
): string {
  const rows: string[] = [];
  let done = 0;
  let total = 0;
  for (const g of games) {
    if (!g.dailyKey) continue; // non-daily card (e.g. Flashcards)
    total += 1;
    const r = resultFor(g.dailyKey);
    if (!r) continue;
    done += 1;
    rows.push(`${g.emoji} ${g.name} ${r.score}/${r.total} ${scoreBar(r.score, r.total)}`);
  }
  if (done === 0) return '';
  return [`Spork · ${date} · ${done}/${total} done`, ...rows, SITE].join('\n');
}
