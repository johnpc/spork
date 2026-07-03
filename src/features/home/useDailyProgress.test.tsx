import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDailyProgress } from './useDailyProgress';
import { recordDailyResult, type KeyValueStore } from '../../games/shared/daily/dailyStore';
import { dayStamp } from '../../games/shared/daily/today';

function memStore(): KeyValueStore {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
}

const NOW = new Date(2026, 6, 3, 12, 0, 0);

describe('useDailyProgress', () => {
  it('tallies done/total and returns each finished result', () => {
    const store = memStore();
    recordDailyResult(store, 'quizzes:MAP', dayStamp(NOW), { score: 3, total: 5 });
    const { result } = renderHook(() =>
      useDailyProgress(['quizzes:MAP', 'steps', undefined], NOW, store as unknown as Storage),
    );
    expect(result.current.total).toBe(2); // undefined key doesn't count
    expect(result.current.done).toBe(1);
    expect(result.current.resultFor('quizzes:MAP')).toEqual({
      score: 3,
      total: 5,
      timeSeconds: undefined,
    });
    expect(result.current.resultFor('steps')).toBeNull();
    expect(result.current.resultFor(undefined)).toBeNull();
  });

  it('reports zero done on a fresh day', () => {
    const { result } = renderHook(() =>
      useDailyProgress(['quizzes:MAP', 'steps'], NOW, memStore() as unknown as Storage),
    );
    expect(result.current).toMatchObject({ done: 0, total: 2 });
  });

  it('handles a missing store without throwing', () => {
    const { result } = renderHook(() => useDailyProgress(['steps'], NOW, null));
    expect(result.current.done).toBe(0);
  });
});
