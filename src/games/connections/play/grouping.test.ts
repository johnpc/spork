import { describe, it, expect } from 'vitest';
import { checkSelection, isWon, isLost, type Group } from './grouping';

const GROUPS: Group[] = [
  { theme: 'Citrus Fruits', words: ['orange', 'lemon', 'lime', 'grapefruit'], level: 0 },
  { theme: 'Bodies of Water', words: ['ocean', 'lake', 'river', 'sea'], level: 1 },
  { theme: 'Metals', words: ['iron', 'copper', 'gold', 'silver'], level: 2 },
  { theme: 'Card Suits', words: ['hearts', 'clubs', 'spades', 'diamonds'], level: 3 },
];

describe('checkSelection', () => {
  it('returns the solved group when all 4 words match', () => {
    const res = checkSelection(['orange', 'lemon', 'lime', 'grapefruit'], GROUPS, new Set());
    expect(res.solved?.theme).toBe('Citrus Fruits');
    expect(res.oneAway).toBe(false);
  });

  it('matches case-insensitively', () => {
    const res = checkSelection(['OCEAN', 'Lake', 'RIVER', 'sea'], GROUPS, new Set());
    expect(res.solved?.theme).toBe('Bodies of Water');
  });

  it('returns oneAway=true when 3 of 4 belong to one group', () => {
    const res = checkSelection(['ocean', 'lake', 'river', 'orange'], GROUPS, new Set());
    expect(res.solved).toBeNull();
    expect(res.oneAway).toBe(true);
  });

  it('returns oneAway=false when no 3-word overlap', () => {
    const res = checkSelection(['ocean', 'orange', 'iron', 'hearts'], GROUPS, new Set());
    expect(res.solved).toBeNull();
    expect(res.oneAway).toBe(false);
  });

  it('skips already-solved groups', () => {
    const res = checkSelection(['orange', 'lemon', 'lime', 'grapefruit'], GROUPS, new Set([0]));
    expect(res.solved).toBeNull();
  });
});

describe('isWon / isLost', () => {
  it('isWon when all 4 groups solved', () => {
    expect(isWon(4)).toBe(true);
    expect(isWon(3)).toBe(false);
  });
  it('isLost when mistakes reach max', () => {
    expect(isLost(4, 4)).toBe(true);
    expect(isLost(3, 4)).toBe(false);
  });
});
