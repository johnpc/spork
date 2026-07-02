import { describe, it, expect } from 'vitest';
import { reorderCards } from './reorderCards';

const cards = [
  { id: 'a', ord: 0 },
  { id: 'b', ord: 1 },
  { id: 'c', ord: 2 },
];

describe('reorderCards', () => {
  it('swaps a card with its previous neighbor on move up', () => {
    expect(reorderCards(cards, 'b', 'up')).toEqual([
      { id: 'b', ord: 0 },
      { id: 'a', ord: 1 },
    ]);
  });

  it('swaps a card with its next neighbor on move down', () => {
    expect(reorderCards(cards, 'b', 'down')).toEqual([
      { id: 'b', ord: 2 },
      { id: 'c', ord: 1 },
    ]);
  });

  it('is a no-op moving the first card up', () => {
    expect(reorderCards(cards, 'a', 'up')).toEqual([]);
  });

  it('is a no-op moving the last card down', () => {
    expect(reorderCards(cards, 'c', 'down')).toEqual([]);
  });

  it('returns no changes for an unknown card', () => {
    expect(reorderCards(cards, 'zzz', 'up')).toEqual([]);
  });

  it('sorts by ord before resolving neighbors (unsorted input)', () => {
    const unsorted = [
      { id: 'c', ord: 2 },
      { id: 'a', ord: 0 },
      { id: 'b', ord: 1 },
    ];
    expect(reorderCards(unsorted, 'c', 'up')).toEqual([
      { id: 'c', ord: 1 },
      { id: 'b', ord: 2 },
    ]);
  });
});
