import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRecordBestScore } from './useRecordBestScore';
import { readBestScore, type KeyValueStore } from './bestScoreStore';

function memStore(): KeyValueStore {
  const map = new Map<string, string>();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

describe('useRecordBestScore', () => {
  it('saves the score once when done flips true', () => {
    const store = memStore();
    const { rerender } = renderHook(({ done }) => useRecordBestScore(done, 'q1', 10, store), {
      initialProps: { done: false },
    });
    expect(readBestScore(store, 'q1')).toBeNull();
    rerender({ done: true });
    expect(readBestScore(store, 'q1')).toBe(10);
  });

  it('does not save without a quizId', () => {
    const store = memStore();
    renderHook(() => useRecordBestScore(true, undefined, 5, store));
    expect(readBestScore(store, 'q1')).toBeNull();
  });

  it('re-arms after the session resets and keeps the higher best', () => {
    const store = memStore();
    const { rerender } = renderHook(
      ({ done, found }) => useRecordBestScore(done, 'q1', found, store),
      { initialProps: { done: true, found: 5 } },
    );
    expect(readBestScore(store, 'q1')).toBe(5);
    rerender({ done: false, found: 8 });
    rerender({ done: true, found: 8 });
    expect(readBestScore(store, 'q1')).toBe(8);
  });

  it('falls back to window.localStorage when no store is injected', () => {
    renderHook(() => useRecordBestScore(true, 'qWin', 11));
    expect(window.localStorage.getItem('spork.bestScore.qWin')).toBe('11');
    window.localStorage.removeItem('spork.bestScore.qWin');
  });
});
