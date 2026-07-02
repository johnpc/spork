import { describe, it, expect } from 'vitest';
import { pickDaily } from './pickDaily';

const T = '2026-07-02';

describe('pickDaily', () => {
  it('returns null for an empty list', () => {
    expect(pickDaily([], T)).toBeNull();
  });

  it('prefers the item stamped with today', () => {
    const items = [
      { id: 'a', puzzleDate: '2026-07-01' },
      { id: 'b', puzzleDate: '2026-07-02' },
      { id: 'c', puzzleDate: '2026-07-03' },
    ];
    expect(pickDaily(items, T)?.id).toBe('b');
  });

  it('falls back to the most recent past date when today is missing', () => {
    const items = [
      { id: 'a', puzzleDate: '2026-06-30' },
      { id: 'b', puzzleDate: '2026-07-01' },
      { id: 'c', puzzleDate: '2026-07-10' }, // future — ignored
    ];
    expect(pickDaily(items, T)?.id).toBe('b');
  });

  it('falls back to the first item when nothing is dated', () => {
    const items = [{ id: 'a' }, { id: 'b', puzzleDate: null }];
    expect(pickDaily(items, T)?.id).toBe('a');
  });
});
