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
    renderHook(() => useRecordDailyOnDone('steps', false, { score: 1, total: 3 }, NOW, store));
    expect(readDailyResult(store, 'steps', '2026-07-02')).toBeNull();
  });

  it('records once when done flips true', () => {
    const store = memStore();
    renderHook(() =>
      useRecordDailyOnDone('steps', true, { score: 2, total: 3, timeSeconds: 12 }, NOW, store),
    );
    expect(readDailyResult(store, 'steps', '2026-07-02')).toEqual({
      score: 2,
      total: 3,
      timeSeconds: 12,
    });
  });

  it('never overwrites an earlier finish (play-once)', () => {
    const store = memStore();
    const { rerender } = renderHook(({ r }) => useRecordDailyOnDone('chess', true, r, NOW, store), {
      initialProps: { r: { score: 1, total: 1 } },
    });
    rerender({ r: { score: 0, total: 1 } });
    expect(readDailyResult(store, 'chess', '2026-07-02')).toEqual({ score: 1, total: 1 });
  });
});
