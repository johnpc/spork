import { describe, it, expect } from 'vitest';
import { readBestScore, saveBestScore, type KeyValueStore } from './bestScoreStore';

/** In-memory KeyValueStore for deterministic tests. */
function memStore(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  };
}

describe('readBestScore', () => {
  it('returns null when nothing is stored', () => {
    expect(readBestScore(memStore(), 'q1')).toBeNull();
  });
  it('parses a stored integer', () => {
    expect(readBestScore(memStore({ 'spork.bestScore.q1': '42' }), 'q1')).toBe(42);
  });
  it('returns null for a non-numeric value', () => {
    expect(readBestScore(memStore({ 'spork.bestScore.q1': 'oops' }), 'q1')).toBeNull();
  });
  it('degrades to null when the store throws', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {},
    };
    expect(readBestScore(broken, 'q1')).toBeNull();
  });
});

describe('saveBestScore', () => {
  it('writes and returns the new best when it beats the stored value', () => {
    const store = memStore({ 'spork.bestScore.q1': '5' });
    expect(saveBestScore(store, 'q1', 12)).toBe(12);
    expect(readBestScore(store, 'q1')).toBe(12);
  });
  it('keeps the stored best when the new score is not higher', () => {
    const store = memStore({ 'spork.bestScore.q1': '20' });
    expect(saveBestScore(store, 'q1', 12)).toBe(20);
    expect(readBestScore(store, 'q1')).toBe(20);
  });
  it('writes from a clean slate', () => {
    const store = memStore();
    expect(saveBestScore(store, 'q1', 3)).toBe(3);
  });
  it('does not throw when setItem fails (quota/private mode)', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(() => saveBestScore(store, 'q1', 3)).not.toThrow();
  });
});
