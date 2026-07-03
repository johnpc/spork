import { describe, it, expect } from 'vitest';
import { buildDaySummaryText, type DaySummaryGame } from './daySummary';
import type { DailyResult } from '../../games/shared/daily/dailyStore';

const games: DaySummaryGame[] = [
  { name: 'Worldle', emoji: '🗺️', dailyKey: 'quizzes:MAP' },
  { name: 'Steps', emoji: '🪜', dailyKey: 'steps' },
  { name: 'Flashcards', emoji: '🃏' }, // non-daily, no key → never counted
];

function lookup(map: Record<string, DailyResult>) {
  return (key?: string) => (key ? (map[key] ?? null) : null);
}

describe('buildDaySummaryText', () => {
  it('returns empty string when nothing is finished', () => {
    expect(buildDaySummaryText(games, lookup({}), '2026-07-03')).toBe('');
  });

  it('builds a header, one row per finished daily game, and the link', () => {
    const text = buildDaySummaryText(
      games,
      lookup({ 'quizzes:MAP': { score: 5, total: 6 } }),
      '2026-07-03',
    );
    // Two daily games total (Flashcards excluded), one done.
    expect(text).toContain('Spork · 2026-07-03 · 1/2 done');
    expect(text).toContain('🗺️ Worldle 5/6');
    expect(text).not.toContain('Steps'); // not finished → no row
    expect(text.split('\n').at(-1)).toBe('spork.jpc.io');
  });

  it('lists every finished game, in shelf order', () => {
    const text = buildDaySummaryText(
      games,
      lookup({ 'quizzes:MAP': { score: 6, total: 6 }, steps: { score: 1, total: 1 } }),
      '2026-07-03',
    );
    expect(text).toContain('1/2 done'.replace('1', '2')); // 2/2 done
    const lines = text.split('\n');
    expect(lines[1]).toContain('Worldle');
    expect(lines[2]).toContain('Steps');
  });

  it('excludes non-daily cards from the total', () => {
    const text = buildDaySummaryText(
      games,
      lookup({ steps: { score: 1, total: 1 } }),
      '2026-07-03',
    );
    expect(text).toContain('1/2 done'); // total is 2, not 3 (Flashcards excluded)
  });
});
