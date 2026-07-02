import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBestScore } from './useBestScore';
import { saveBestScore, type KeyValueStore } from './bestScoreStore';

function memStore(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed));
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

describe('useBestScore', () => {
  it('reads the saved best from the device store', () => {
    const store = memStore({ 'spork.bestScore.q1': '42' });
    const { result } = renderHook(() => useBestScore('q1', store));
    expect(result.current.best).toBe(42);
  });

  it('is null when never played or no quizId', () => {
    expect(renderHook(() => useBestScore('q1', memStore())).result.current.best).toBeNull();
    expect(renderHook(() => useBestScore(undefined, memStore())).result.current.best).toBeNull();
  });

  it('refresh re-reads a newly-saved best', () => {
    const store = memStore();
    const { result } = renderHook(() => useBestScore('q1', store));
    expect(result.current.best).toBeNull();
    saveBestScore(store, 'q1', 7);
    act(() => result.current.refresh());
    expect(result.current.best).toBe(7);
  });

  it('falls back to window.localStorage when no store is injected', () => {
    window.localStorage.setItem('spork.bestScore.qWin', '9');
    const { result } = renderHook(() => useBestScore('qWin'));
    expect(result.current.best).toBe(9);
    window.localStorage.removeItem('spork.bestScore.qWin');
  });
});
