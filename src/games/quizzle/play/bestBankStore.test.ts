import { describe, it, expect, vi } from 'vitest';
import { readBestBank, saveBestBank, type KeyValueStore } from './bestBankStore';

function memStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe('readBestBank', () => {
  it('returns null when unset', () => {
    expect(readBestBank(memStore(), 'q1')).toBeNull();
  });
  it('parses a stored number', () => {
    expect(readBestBank(memStore({ 'spork.quizzle.bestBank.q1': '1200' }), 'q1')).toBe(1200);
  });
  it('returns null on unparseable / throwing store', () => {
    expect(readBestBank(memStore({ 'spork.quizzle.bestBank.q1': 'x' }), 'q1')).toBeNull();
    const bad: KeyValueStore = {
      getItem: () => {
        throw new Error('boom');
      },
      setItem: vi.fn(),
    };
    expect(readBestBank(bad, 'q1')).toBeNull();
  });
});

describe('saveBestBank', () => {
  it('saves and returns a new best', () => {
    const s = memStore();
    expect(saveBestBank(s, 'q1', 800)).toBe(800);
    expect(readBestBank(s, 'q1')).toBe(800);
  });
  it('keeps the prior best when not beaten', () => {
    const s = memStore({ 'spork.quizzle.bestBank.q1': '900' });
    expect(saveBestBank(s, 'q1', 800)).toBe(900);
  });
  it('tolerates a throwing setItem', () => {
    const bad: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(saveBestBank(bad, 'q1', 500)).toBe(500);
  });
});
