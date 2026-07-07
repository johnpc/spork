import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRecordDailyOnDone } from './useRecordDailyOnDone';
import { readDailyResult, type KeyValueStore } from './dailyStore';

function memStore(): KeyValueStore {
  const map = new Map<string, string>();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}
const NOW = new Date(2026, 6, 2); // 2026-07-02

describe('useRecordDailyOnDone', () => {
  it('does not record while the session is unfinished', () => {
    const store = memStore();
    renderHook(() =>
      useRecordDailyOnDone('steps', false, { score: 1, total: 3 }, undefined, NOW, store),
    );
    expect(readDailyResult(store, 'steps', '2026-07-02')).toBeNull();
  });

  it('records once when done flips true', () => {
    const store = memStore();
    renderHook(
      () =>
      useRecordDailyOnDone('steps', true, { score: 2, total: 3, timeSeconds: 12 }, undefined, NOW, store), // prettier-ignore
    );
    expect(readDailyResult(store, 'steps', '2026-07-02')).toEqual({
      score: 2,
      total: 3,
      timeSeconds: 12,
    });
  });

  it('never overwrites an earlier finish (play-once)', () => {
    const store = memStore();
    const { rerender } = renderHook(
      ({ r }) => useRecordDailyOnDone('chess', true, r, undefined, NOW, store),
      { initialProps: { r: { score: 1, total: 1 } } },
    );
    rerender({ r: { score: 0, total: 1 } });
    expect(readDailyResult(store, 'chess', '2026-07-02')).toEqual({ score: 1, total: 1 });
  });

  it('records under the puzzle’s own day when one is given (past-day session)', () => {
    const store = memStore();
    renderHook(() =>
      useRecordDailyOnDone('wordle', true, { score: 1, total: 1 }, '2026-06-20', NOW, store),
    );
    expect(readDailyResult(store, 'wordle', '2026-06-20')).toEqual({ score: 1, total: 1 });
    expect(readDailyResult(store, 'wordle', '2026-07-02')).toBeNull();
  });
});
