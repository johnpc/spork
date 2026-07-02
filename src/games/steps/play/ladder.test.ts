import { describe, it, expect } from 'vitest';
import { oneLetterApart, checkStep, isSolved, parMoves } from './ladder';

describe('oneLetterApart', () => {
  it('true for exactly one differing letter', () => {
    expect(oneLetterApart('cat', 'cot')).toBe(true);
    expect(oneLetterApart('cold', 'cord')).toBe(true);
  });
  it('false for zero, two+, or length mismatch', () => {
    expect(oneLetterApart('cat', 'cat')).toBe(false);
    expect(oneLetterApart('cat', 'dog')).toBe(false);
    expect(oneLetterApart('cat', 'cats')).toBe(false);
  });
});

describe('checkStep', () => {
  const dict = new Set(['cat', 'cot', 'cog', 'dog']);
  const used = new Set(['cat']);

  it('accepts a valid one-letter dictionary word not yet used', () => {
    expect(checkStep('cat', 'cot', dict, used)).toEqual({ ok: true });
  });
  it('rejects a non-dictionary word', () => {
    expect(checkStep('cat', 'caz', dict, used)).toMatchObject({ ok: false, reason: 'not-a-word' });
  });
  it('rejects a two-letter change', () => {
    expect(checkStep('cat', 'dog', dict, used)).toMatchObject({
      ok: false,
      reason: 'not-one-letter',
    });
  });
  it('rejects a length mismatch first', () => {
    expect(checkStep('cat', 'cats', dict, used)).toMatchObject({ ok: false, reason: 'length' });
  });
  it('rejects a repeat', () => {
    expect(checkStep('cot', 'cat', dict, new Set(['cat', 'cot']))).toMatchObject({
      ok: false,
      reason: 'repeat',
    });
  });
});

describe('isSolved / parMoves', () => {
  it('isSolved compares current to target', () => {
    expect(isSolved('dog', 'dog')).toBe(true);
    expect(isSolved('cog', 'dog')).toBe(false);
  });
  it('parMoves is path length minus the start word', () => {
    expect(parMoves(['cat', 'cot', 'cog', 'dog'])).toBe(3);
    expect(parMoves([])).toBe(0);
  });
});
