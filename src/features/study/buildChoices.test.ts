import { describe, it, expect } from 'vitest';
import { buildChoices } from './buildChoices';
import type { CardRecord } from '../../lib/dataClient';

const card = (id: string, front: string, back: string): CardRecord =>
  ({ id, deckId: 'd1', ord: 0, front, back }) as CardRecord;

const deck = [
  card('c1', 'Hola', 'Hello'),
  card('c2', 'Gracias', 'Thanks'),
  card('c3', 'Adiós', 'Bye'),
  card('c4', 'Por favor', 'Please'),
  card('c5', 'Sí', 'Yes'),
];

// Deterministic "shuffle" = identity, so assertions are stable.
const noShuffle = <T>(a: T[]): T[] => a;

describe('buildChoices', () => {
  it('uses the back as the answer when direction is front', () => {
    const c = buildChoices(deck[0], deck, 'front', noShuffle);
    expect(c.answer).toBe('Hello');
    expect(c.options).toContain('Hello');
  });

  it('uses the front as the answer when direction is back', () => {
    const c = buildChoices(deck[0], deck, 'back', noShuffle);
    expect(c.answer).toBe('Hola');
  });

  it('returns at most 4 options (answer + 3 distractors)', () => {
    const c = buildChoices(deck[0], deck, 'front', noShuffle);
    expect(c.options).toHaveLength(4);
    expect(new Set(c.options).size).toBe(4); // all distinct
  });

  it('never includes the correct answer as a distractor', () => {
    const c = buildChoices(deck[0], deck, 'front', noShuffle);
    expect(c.options.filter((o) => o === 'Hello')).toHaveLength(1);
  });

  it('handles a tiny deck (fewer than 4 cards) gracefully', () => {
    const tiny = [card('a', 'A', 'Aa'), card('b', 'B', 'Bb')];
    const c = buildChoices(tiny[0], tiny, 'front', noShuffle);
    expect(c.answer).toBe('Aa');
    expect(c.options).toEqual(['Aa', 'Bb']); // answer + 1 available distractor
  });

  it('passes options through the injected shuffle', () => {
    const reverse = <T>(a: T[]): T[] => [...a].reverse();
    const c = buildChoices(deck[0], deck, 'front', reverse);
    expect(c.options).toContain('Hello');
    expect(c.options.length).toBeGreaterThan(1);
  });
});
