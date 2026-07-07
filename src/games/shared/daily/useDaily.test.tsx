import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDaily } from './useDaily';
import { readDailyResult, type KeyValueStore } from './dailyStore';

function memStore(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed));
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}
const NOW = new Date(2026, 6, 2); // 2026-07-02

describe('useDaily', () => {
  it('is not-played on a fresh device', () => {
    const { result } = renderHook(() => useDaily('quizzes', undefined, NOW, memStore()));
    expect(result.current.playedToday).toBe(false);
    expect(result.current.date).toBe('2026-07-02');
  });

  it('reads an existing result for today', () => {
    const store = memStore({
      'spork.daily.quizzes.2026-07-02': JSON.stringify({ score: 3, total: 5 }),
    });
    const { result } = renderHook(() => useDaily('quizzes', undefined, NOW, store));
    expect(result.current.playedToday).toBe(true);
    expect(result.current.result).toEqual({ score: 3, total: 5 });
  });

  it('record persists today’s result and flips playedToday', () => {
    const store = memStore();
    const { result } = renderHook(() => useDaily('steps', undefined, NOW, store));
    act(() => result.current.record({ score: 4, total: 4, timeSeconds: 30 }));
    expect(result.current.playedToday).toBe(true);
    expect(readDailyResult(store, 'steps', '2026-07-02')).toMatchObject({ score: 4, total: 4 });
  });

  it('gates an explicit PAST day, not today', () => {
    const store = memStore({
      'spork.daily.quizzes.2026-06-20': JSON.stringify({ score: 2, total: 5 }),
    });
    const { result } = renderHook(() => useDaily('quizzes', '2026-06-20', NOW, store));
    expect(result.current.date).toBe('2026-06-20');
    expect(result.current.result).toEqual({ score: 2, total: 5 });
  });
});
