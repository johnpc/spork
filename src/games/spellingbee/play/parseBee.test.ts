import { describe, it, expect } from 'vitest';
import { parseWordList } from './parseBee';

describe('parseWordList', () => {
  it('parses a valid JSON array', () => {
    expect(parseWordList('["hello","world"]')).toEqual(['hello', 'world']);
  });

  it('normalizes to lowercase', () => {
    expect(parseWordList('["HELLO","World"]')).toEqual(['hello', 'world']);
  });

  it('filters non-strings', () => {
    expect(parseWordList('[1,"valid",null,{}]')).toEqual(['valid']);
  });

  it('returns empty for null', () => {
    expect(parseWordList(null)).toEqual([]);
  });

  it('returns empty for undefined', () => {
    expect(parseWordList(undefined)).toEqual([]);
  });

  it('returns empty for malformed JSON', () => {
    expect(parseWordList('{')).toEqual([]);
    expect(parseWordList('not json')).toEqual([]);
  });

  it('returns empty for non-array JSON', () => {
    expect(parseWordList('{"a":"b"}')).toEqual([]);
    expect(parseWordList('"string"')).toEqual([]);
  });
});
