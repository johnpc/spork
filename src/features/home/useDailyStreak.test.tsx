import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDailyStreak } from './useDailyStreak';

function storeWith(keys: string[]): Storage {
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  } as unknown as Storage;
}

const NOW = new Date(2026, 6, 3, 12, 0, 0);

describe('useDailyStreak', () => {
  it('derives the streak from played-day keys in the store', () => {
    const store = storeWith([
      'spork.daily.quizzes:MAP.2026-07-02',
      'spork.daily.steps.2026-07-03',
      'unrelated',
    ]);
    const { result } = renderHook(() => useDailyStreak(NOW, store));
    expect(result.current).toBe(2);
  });

  it('is 0 with no store', () => {
    const { result } = renderHook(() => useDailyStreak(NOW, null));
    expect(result.current).toBe(0);
  });
});
