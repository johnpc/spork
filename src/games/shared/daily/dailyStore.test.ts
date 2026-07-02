import { describe, it, expect } from 'vitest';
import { readDailyResult, recordDailyResult, type KeyValueStore } from './dailyStore';

function memStore(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed));
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

describe('readDailyResult', () => {
  it('returns null when not played', () => {
    expect(readDailyResult(memStore(), 'quizzes', '2026-07-02')).toBeNull();
  });
  it('parses a stored result', () => {
    const store = memStore({
      'spork.daily.quizzes.2026-07-02': JSON.stringify({ score: 5, total: 8, timeSeconds: 42 }),
    });
    expect(readDailyResult(store, 'quizzes', '2026-07-02')).toEqual({
      score: 5,
      total: 8,
      timeSeconds: 42,
    });
  });
  it('returns null on malformed / non-numeric payloads', () => {
    expect(readDailyResult(memStore({ 'spork.daily.q.d': 'nope' }), 'q', 'd')).toBeNull();
    expect(
      readDailyResult(memStore({ 'spork.daily.q.d': '{"score":"x","total":1}' }), 'q', 'd'),
    ).toBeNull();
  });
});

describe('recordDailyResult', () => {
  it('stores + returns the result', () => {
    const store = memStore();
    const r = recordDailyResult(store, 'chess', '2026-07-02', { score: 1, total: 1 });
    expect(r).toEqual({ score: 1, total: 1 });
    expect(readDailyResult(store, 'chess', '2026-07-02')).toEqual({ score: 1, total: 1 });
  });
  it('never overwrites an existing result (play-once)', () => {
    const store = memStore();
    recordDailyResult(store, 'chess', '2026-07-02', { score: 1, total: 1 });
    const second = recordDailyResult(store, 'chess', '2026-07-02', { score: 0, total: 1 });
    expect(second).toEqual({ score: 1, total: 1 }); // first finish stands
  });
  it('does not throw when the store write fails', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(() => recordDailyResult(store, 'q', 'd', { score: 1, total: 2 })).not.toThrow();
  });
});
