import { describe, it, expect } from 'vitest';
import { matchAnswer } from './matchAnswer';

const index = new Map([
  ['brazil', 'a1'],
  ['united states', 'a2'],
  ['usa', 'a2'],
]);

describe('matchAnswer', () => {
  it('returns the answer id for an accepted spelling', () => {
    expect(matchAnswer('Brazil', index)).toBe('a1');
  });
  it('matches leniently (case/accent/punct via normalize)', () => {
    expect(matchAnswer('  U.S.A.  ', index)).toBe('a2');
  });
  it('returns null for an unknown guess', () => {
    expect(matchAnswer('Narnia', index)).toBeNull();
  });
});
