import { describe, it, expect } from 'vitest';
import { normalizeGuess, isCorrect, clampWager, applyWager } from './quizzleEngine';

describe('normalizeGuess', () => {
  it('lowercases, strips accents and punctuation', () => {
    expect(normalizeGuess("Côte d'Ivoire")).toBe('cote divoire');
    expect(normalizeGuess('  PARIS! ')).toBe('paris');
  });
  it('collapses whitespace and returns empty for blank', () => {
    expect(normalizeGuess('New   York')).toBe('new york');
    expect(normalizeGuess('   ')).toBe('');
  });
});

describe('isCorrect', () => {
  const q = { question: 'Capital of France?', answer: 'Paris', accepted: ['Ville Lumiere'] };
  it('matches the canonical answer leniently', () => {
    expect(isCorrect('paris', q)).toBe(true);
    expect(isCorrect('PARIS', q)).toBe(true);
  });
  it('matches an accepted spelling', () => {
    expect(isCorrect('ville lumiere', q)).toBe(true);
  });
  it('rejects a wrong or blank guess', () => {
    expect(isCorrect('london', q)).toBe(false);
    expect(isCorrect('', q)).toBe(false);
  });
  it('works when accepted is missing', () => {
    expect(isCorrect('tokyo', { question: 'q', answer: 'Tokyo' })).toBe(true);
  });
  it('forgives a typo (fuzzy match) on a longer answer', () => {
    const falcon = { question: 'Han Solo’s ship?', answer: 'Millennium Falcon' };
    expect(isCorrect('millenium falcon', falcon)).toBe(true); // dropped an n
    expect(isCorrect('millennium falcom', falcon)).toBe(true); // n→m slip
  });
  it('still rejects a genuinely wrong answer', () => {
    expect(isCorrect('x-wing', { question: 'q', answer: 'Millennium Falcon' })).toBe(false);
  });
});

describe('clampWager', () => {
  it('clamps into [1, bank]', () => {
    expect(clampWager(500, 1000)).toBe(500);
    expect(clampWager(0, 1000)).toBe(1);
    expect(clampWager(5000, 1000)).toBe(1000);
  });
  it('floors fractional and handles non-finite', () => {
    expect(clampWager(3.9, 1000)).toBe(3);
    expect(clampWager(Number.NaN, 1000)).toBe(1);
  });
});

describe('applyWager', () => {
  it('adds when correct, subtracts when wrong', () => {
    expect(applyWager(1000, 500, true)).toBe(1500);
    expect(applyWager(1000, 500, false)).toBe(500);
  });
  it('clamps the stake and never goes below zero', () => {
    expect(applyWager(300, 9999, false)).toBe(0);
    expect(applyWager(0, 50, false)).toBe(0);
  });
});
