import { describe, it, expect } from 'vitest';
import { composeDueSummary } from './composeDueSummary';

describe('composeDueSummary', () => {
  it('totals due counts across decks', () => {
    const s = composeDueSummary([
      { deckId: 'a', topic: 'A', dueCount: 5 },
      { deckId: 'b', topic: 'B', dueCount: 3 },
    ]);
    expect(s.total).toBe(8);
    expect(s.decks).toHaveLength(2);
  });

  it('drops decks with nothing due', () => {
    const s = composeDueSummary([
      { deckId: 'a', topic: 'A', dueCount: 0 },
      { deckId: 'b', topic: 'B', dueCount: 4 },
    ]);
    expect(s.decks.map((d) => d.deckId)).toEqual(['b']);
    expect(s.total).toBe(4);
  });

  it('orders decks most-due first', () => {
    const s = composeDueSummary([
      { deckId: 'a', topic: 'A', dueCount: 2 },
      { deckId: 'b', topic: 'B', dueCount: 9 },
      { deckId: 'c', topic: 'C', dueCount: 5 },
    ]);
    expect(s.decks.map((d) => d.deckId)).toEqual(['b', 'c', 'a']);
  });

  it('is empty when nothing is due anywhere', () => {
    expect(composeDueSummary([{ deckId: 'a', topic: 'A', dueCount: 0 }])).toEqual({
      total: 0,
      decks: [],
    });
  });
});
