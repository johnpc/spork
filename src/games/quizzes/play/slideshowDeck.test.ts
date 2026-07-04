import { describe, it, expect } from 'vitest';
import { orderedSlides, deckState } from './slideshowDeck';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (o: Partial<AnswerRecord>): AnswerRecord => o as AnswerRecord;

const answers: AnswerRecord[] = [
  mk({ id: 'b', display: 'Beta', promptKind: 'TEXT', promptValue: 'Clue B', orderIndex: 1 }),
  mk({ id: 'a', display: 'Alpha', promptKind: 'TEXT', promptValue: 'Clue A', orderIndex: 0 }),
  mk({ id: 'c', display: 'Gamma', promptKind: 'IMAGE', promptValue: 'img/c.png', orderIndex: 2 }),
];

describe('orderedSlides', () => {
  it('orders by orderIndex, keeping a stable deck sequence', () => {
    expect(orderedSlides(answers).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('defaults missing prompt fields without throwing', () => {
    const [s] = orderedSlides([mk({ id: 'x' })]);
    expect(s).toEqual({ id: 'x', promptKind: 'TEXT', promptValue: '', display: '' });
  });

  it('falls back to display sort when orderIndex is absent', () => {
    const noIdx = [mk({ id: 'z', display: 'Zed' }), mk({ id: 'a', display: 'Ann' })];
    expect(orderedSlides(noIdx).map((s) => s.id)).toEqual(['a', 'z']);
  });
});

describe('deckState', () => {
  it('surfaces the first unfound slide as current with 1-based position', () => {
    const st = deckState(answers, new Set(['a']));
    expect(st.current?.id).toBe('b');
    expect(st.position).toBe(2);
    expect(st.total).toBe(3);
  });

  it('starts at the first slide when nothing is found', () => {
    const st = deckState(answers, new Set());
    expect(st.current?.id).toBe('a');
    expect(st.position).toBe(1);
  });

  it('reports no current slide and position 0 once the deck is cleared', () => {
    const st = deckState(answers, new Set(['a', 'b', 'c']));
    expect(st.current).toBeNull();
    expect(st.position).toBe(0);
    expect(st.total).toBe(3);
    expect(st.remaining).toBe(0);
  });

  it('reports how many slides remain unfound', () => {
    expect(deckState(answers, new Set()).remaining).toBe(3);
    expect(deckState(answers, new Set(['a'])).remaining).toBe(2);
  });

  it('a cursor selects the Nth unfound slide (Skip), wrapping around', () => {
    // Nothing found: cursor 0→a, 1→b, 2→c, 3 wraps back to a.
    expect(deckState(answers, new Set(), 0).current?.id).toBe('a');
    expect(deckState(answers, new Set(), 1).current?.id).toBe('b');
    expect(deckState(answers, new Set(), 2).current?.id).toBe('c');
    expect(deckState(answers, new Set(), 3).current?.id).toBe('a');
  });

  it('skips only among UNFOUND slides — found ones drop out of the ring', () => {
    // 'a' found → unfound ring is [b, c]; cursor 0→b, 1→c, 2 wraps to b.
    const found = new Set(['a']);
    expect(deckState(answers, found, 0).current?.id).toBe('b');
    expect(deckState(answers, found, 1).current?.id).toBe('c');
    expect(deckState(answers, found, 2).current?.id).toBe('b');
  });
});
