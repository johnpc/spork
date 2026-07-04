import { describe, it, expect } from 'vitest';
import { isPangram, scoreWord, validateGuess } from './beeRules';

describe('isPangram', () => {
  it('returns true when word uses all 7 distinct letters', () => {
    expect(isPangram('abcdefg', 'abcdefg')).toBe(true);
    expect(isPangram('defgabc', 'abcdefg')).toBe(true);
    expect(isPangram('aabbccddeeffgg', 'abcdefg')).toBe(true);
  });

  it('returns false when word missing a letter', () => {
    expect(isPangram('abcdef', 'abcdefg')).toBe(false);
    expect(isPangram('abcdefh', 'abcdefg')).toBe(false);
  });

  it('returns false for invalid letter sets', () => {
    expect(isPangram('abcdefg', 'abc')).toBe(false);
  });
});

describe('scoreWord', () => {
  it('scores 4-letter words as 1 point', () => {
    expect(scoreWord('abcd', 'abcdefg')).toBe(1);
  });

  it('scores longer words as their length', () => {
    expect(scoreWord('abcde', 'abcdefg')).toBe(5);
    expect(scoreWord('abcdef', 'abcdefg')).toBe(6);
  });

  it('adds 7 bonus for pangrams', () => {
    expect(scoreWord('abcdefg', 'abcdefg')).toBe(14); // 7 + 7
    expect(scoreWord('aabbccddeeffgg', 'abcdefg')).toBe(21); // 14 + 7
  });

  it('scores non-pangrams without bonus', () => {
    expect(scoreWord('aaaa', 'abcdefg')).toBe(1);
    expect(scoreWord('aaaaa', 'abcdefg')).toBe(5);
  });
});

describe('validateGuess', () => {
  const ctx = {
    letters: 'abcdefg',
    centerLetter: 'd',
    answers: ['abcd', 'defg', 'abcdefg'],
    foundWords: [] as string[],
  };

  it('accepts a valid word', () => {
    const r = validateGuess('abcd', ctx);
    expect(r.ok).toBe(true);
    expect(r.reason).toBe('ok');
  });

  it('rejects words too short', () => {
    const r = validateGuess('abc', ctx);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('too-short');
  });

  it('rejects words missing the center letter', () => {
    const r = validateGuess('abce', { ...ctx, answers: ['abce'] });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('no-center');
  });

  it('rejects words with invalid letters', () => {
    const r = validateGuess('abcdx', { ...ctx, answers: ['abcdx'] });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('bad-letter');
  });

  it('rejects words not in the answer list', () => {
    const r = validateGuess('abde', ctx);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not-a-word');
  });

  it('rejects already-found words', () => {
    const r = validateGuess('abcd', { ...ctx, foundWords: ['abcd'] });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('already-found');
  });

  it('allows duplicate letters within words', () => {
    const r = validateGuess('abcdefg', { ...ctx, answers: ['abcdefg'] });
    expect(r.ok).toBe(true);
  });
});
