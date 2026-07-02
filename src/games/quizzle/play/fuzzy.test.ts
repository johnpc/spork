import { describe, it, expect } from 'vitest';
import { editDistance, tolerance, fuzzyMatch } from './fuzzy';

describe('editDistance', () => {
  it('is 0 for equal strings', () => {
    expect(editDistance('nile', 'nile')).toBe(0);
  });
  it('counts single edits', () => {
    expect(editDistance('millenium falcon', 'millennium falcon')).toBe(1); // one insert
    expect(editDistance('color', 'colour')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });
  it('handles empty strings', () => {
    expect(editDistance('', 'abc')).toBe(3);
    expect(editDistance('abc', '')).toBe(3);
  });
});

describe('tolerance', () => {
  it('requires exact match for very short answers', () => {
    expect(tolerance(3)).toBe(0);
    expect(tolerance(2)).toBe(0);
  });
  it('scales ~1 edit per 6 chars, capped at 3', () => {
    expect(tolerance(6)).toBe(2); // floor(6/6)+1 = 2
    expect(tolerance(10)).toBe(2);
    expect(tolerance(30)).toBe(3); // capped
  });
});

describe('fuzzyMatch', () => {
  it('forgives a real typo in a long answer', () => {
    expect(fuzzyMatch('millenium falcon', 'millennium falcon')).toBe(true);
  });
  it('rejects a genuinely different short answer', () => {
    expect(fuzzyMatch('cat', 'dog')).toBe(false);
    expect(fuzzyMatch('rome', 'paris')).toBe(false);
  });
  it('rejects empty input', () => {
    expect(fuzzyMatch('', 'nile')).toBe(false);
    expect(fuzzyMatch('nile', '')).toBe(false);
  });
});
