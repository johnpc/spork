/**
 * Build the spoiler-free shareable result for a finished daily puzzle — the
 * Wordle-style brag string players copy into chats/social. No answers, just the
 * game, the date, a score bar, and the link. Pure so it's unit-tested and reused
 * by every game's recap. `mmss` formats the optional time.
 */
export interface ShareInput {
  game: string; // display name, e.g. "Worldle"
  score: number;
  total: number;
  timeSeconds?: number;
  date: string; // YYYY-MM-DD
}

const SITE = 'spork.jpc.io';

/** m:ss for a duration (e.g. 65 → "1:05"). */
export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, '0')}`;
}

/** A 🟩/⬜ bar of `score` filled out of `total`, capped at 10 cells so a big set
 * stays a tidy one-liner. Always ≥1 cell; all-green on a perfect score. */
export function scoreBar(score: number, total: number): string {
  if (total <= 0) return '';
  const cells = Math.min(total, 10);
  const filled = Math.round((score / total) * cells);
  return '🟩'.repeat(filled) + '⬜'.repeat(cells - filled);
}

/** The full share text. */
export function buildShareText(i: ShareInput): string {
  const bar = scoreBar(i.score, i.total);
  const time = i.timeSeconds != null ? ` · ${mmss(i.timeSeconds)}` : '';
  return [`Spork ${i.game} · ${i.date}`, `${i.score}/${i.total}${time}`, bar, SITE]
    .filter(Boolean)
    .join('\n');
}
