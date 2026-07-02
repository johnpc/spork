import { describe, it, expect } from 'vitest';
import { parseWordList } from './parseLadder';

describe('parseWordList', () => {
  it('parses a JSON array and lowercases', () => {
    expect(parseWordList('["Cat","COT"]')).toEqual(['cat', 'cot']);
  });
  it('returns [] for null / invalid / non-array', () => {
    expect(parseWordList(null)).toEqual([]);
    expect(parseWordList('nope')).toEqual([]);
    expect(parseWordList('{"a":1}')).toEqual([]);
  });
  it('drops non-string entries', () => {
    expect(parseWordList('["ok",1,null]')).toEqual(['ok']);
  });
});
