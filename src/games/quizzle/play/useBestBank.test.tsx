import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBestBank } from './useBestBank';
import { readBestBank, type KeyValueStore } from './bestBankStore';

function memStore(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed));
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

describe('useBestBank', () => {
  it('reads the stored best on mount', () => {
    const store = memStore({ 'spork.quizzle.bestBank.q1': '1500' });
    const { result } = renderHook(() => useBestBank(store, 'q1', false, 0));
    expect(result.current).toBe(1500);
  });

  it('persists + returns the finished bank when done and it beats the prior', () => {
    const store = memStore();
    const { result } = renderHook(() => useBestBank(store, 'q1', true, 1800));
    expect(result.current).toBe(1800);
    expect(readBestBank(store, 'q1')).toBe(1800);
  });

  it('is null without an id', () => {
    const { result } = renderHook(() => useBestBank(memStore(), undefined, false, 0));
    expect(result.current).toBeNull();
  });

  it('does not persist while the session is unfinished', () => {
    const store = memStore();
    renderHook(() => useBestBank(store, 'q1', false, 999));
    expect(readBestBank(store, 'q1')).toBeNull();
  });
});
