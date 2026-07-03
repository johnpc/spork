import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNextGame } from './useNextGame';
import { DAILY_REFS } from './nextGame';
import { dayStamp } from './today';

const NOW = new Date(2026, 6, 3, 12, 0, 0);

function storeWithPlayed(keys: string[]): Storage {
  const date = dayStamp(NOW);
  const set = new Set(keys.map((k) => `spork.daily.${k}.${date}`));
  return {
    getItem: (k: string) => (set.has(k) ? JSON.stringify({ score: 1, total: 1 }) : null),
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as unknown as Storage;
}

describe('useNextGame', () => {
  it('finds the next unplayed daily game after the current slug', () => {
    const { result } = renderHook(() => useNextGame(DAILY_REFS[0].slug, NOW, storeWithPlayed([])));
    expect(result.current?.slug).toBe(DAILY_REFS[1].slug);
  });

  it('skips a game already finished today', () => {
    const { result } = renderHook(() =>
      useNextGame(DAILY_REFS[0].slug, NOW, storeWithPlayed([DAILY_REFS[1].dailyKey])),
    );
    expect(result.current?.slug).toBe(DAILY_REFS[2].slug);
  });

  it('returns null with no store', () => {
    const { result } = renderHook(() => useNextGame(DAILY_REFS[0].slug, NOW, null));
    // With no store, nothing is played, so it still suggests the next in order.
    expect(result.current?.slug).toBe(DAILY_REFS[1].slug);
  });
});
