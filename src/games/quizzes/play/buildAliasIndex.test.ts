import { describe, it, expect } from 'vitest';
import { buildAliasIndex, parseAccepted } from './buildAliasIndex';
import type { AnswerRecord } from '../../../lib/dataClient';

const answer = (id: string, accepted: string[]): AnswerRecord =>
  ({ id, accepted: JSON.stringify(accepted) }) as AnswerRecord;

describe('parseAccepted', () => {
  it('parses a JSON string array', () => {
    expect(parseAccepted('["a","b"]')).toEqual(['a', 'b']);
  });
  it('returns [] for null/invalid/non-array', () => {
    expect(parseAccepted(null)).toEqual([]);
    expect(parseAccepted('not json')).toEqual([]);
    expect(parseAccepted('{"a":1}')).toEqual([]);
  });
  it('drops non-string entries', () => {
    expect(parseAccepted('["ok",1,null]')).toEqual(['ok']);
  });
});

describe('buildAliasIndex', () => {
  it('maps every normalized spelling to its answer id', () => {
    const index = buildAliasIndex([answer('a1', ['United States', 'USA', 'America'])]);
    expect(index.get('united states')).toBe('a1');
    expect(index.get('usa')).toBe('a1');
    expect(index.get('america')).toBe('a1');
  });

  it('first answer wins a shared alias (stable matches)', () => {
    const index = buildAliasIndex([answer('a1', ['Congo']), answer('a2', ['Congo'])]);
    expect(index.get('congo')).toBe('a1');
  });

  it('skips empty/blank spellings', () => {
    const index = buildAliasIndex([answer('a1', ['', '   ', 'Chad'])]);
    expect(index.has('')).toBe(false);
    expect(index.get('chad')).toBe('a1');
  });
});
