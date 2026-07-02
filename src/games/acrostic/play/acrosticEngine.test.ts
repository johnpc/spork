import { describe, it, expect } from 'vitest';
import { normalize, matchesAnswer, isComplete, revealQuote } from './acrosticEngine';

describe('normalize', () => {
  it('lowercases and strips spaces + punctuation', () => {
    expect(normalize('New York!')).toBe('newyork');
    expect(normalize('  Côte  ')).toBe('cte');
    expect(normalize('Isn’t it')).toBe('isntit');
  });
});

describe('matchesAnswer', () => {
  it('matches case- and space-insensitively', () => {
    expect(matchesAnswer('CAT', 'cat')).toBe(true);
    expect(matchesAnswer(' Cat ', 'cat')).toBe(true);
    expect(matchesAnswer('new york', 'New York')).toBe(true);
  });
  it('rejects a mismatch or empty guess', () => {
    expect(matchesAnswer('dog', 'cat')).toBe(false);
    expect(matchesAnswer('   ', 'cat')).toBe(false);
    expect(matchesAnswer('', 'cat')).toBe(false);
  });
});

describe('isComplete', () => {
  it('true only when all clues solved', () => {
    expect(isComplete(new Set([0, 1, 2]), 3)).toBe(true);
    expect(isComplete(new Set([0, 1]), 3)).toBe(false);
  });
  it('false for a zero-clue puzzle', () => {
    expect(isComplete(new Set(), 0)).toBe(false);
  });
});

describe('revealQuote', () => {
  const quote = 'Do or do not';

  it('masks all words at zero solved', () => {
    expect(revealQuote(quote, 0, 4)).toEqual(['__', '__', '__', '___']);
  });
  it('reveals a proportional prefix of words', () => {
    expect(revealQuote(quote, 2, 4)).toEqual(['Do', 'or', '__', '___']);
  });
  it('reveals the whole quote when complete', () => {
    expect(revealQuote(quote, 4, 4)).toEqual(['Do', 'or', 'do', 'not']);
  });
  it('returns raw words when there are no clues', () => {
    expect(revealQuote(quote, 0, 0)).toEqual(['Do', 'or', 'do', 'not']);
  });
});
