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
  });
});
