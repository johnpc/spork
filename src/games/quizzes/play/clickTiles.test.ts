import { describe, it, expect } from 'vitest';
import { parseDecoys, decoysOf, buildTiles } from './clickTiles';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'Egypt' },
  { id: 'a2', display: 'Kenya' },
] as AnswerRecord[];

describe('parseDecoys', () => {
  it('accepts a real string array', () => {
    expect(parseDecoys(['France', 'Peru'])).toEqual(['France', 'Peru']);
  });

  it('parses a JSON string array', () => {
    expect(parseDecoys('["France","Peru"]')).toEqual(['France', 'Peru']);
  });

  it('drops non-string members', () => {
    expect(parseDecoys(['France', 3, null])).toEqual(['France']);
  });

  it('returns [] for junk / non-array / bad JSON', () => {
    expect(parseDecoys(undefined)).toEqual([]);
    expect(parseDecoys('not json')).toEqual([]);
    expect(parseDecoys('{"a":1}')).toEqual([]);
    expect(parseDecoys(42)).toEqual([]);
  });
});

describe('decoysOf', () => {
  it('reads the decoy pool off the first answer that carries options', () => {
    const withOptions = [
      { id: 'a1', display: 'Egypt' },
      { id: 'a2', display: 'Kenya', options: '["France","Peru"]' },
    ] as AnswerRecord[];
    expect(decoysOf(withOptions)).toEqual(['France', 'Peru']);
  });

  it('returns [] when no answer carries options', () => {
    expect(decoysOf(answers)).toEqual([]);
  });
});

describe('buildTiles', () => {
  it('mixes answers (with id) and decoys (id null), sorted by label', () => {
    const tiles = buildTiles(answers, ['France', 'Peru']);
    expect(tiles.map((t) => t.label)).toEqual(['Egypt', 'France', 'Kenya', 'Peru']);
    expect(tiles.find((t) => t.label === 'Egypt')?.answerId).toBe('a1');
    expect(tiles.find((t) => t.label === 'France')?.answerId).toBeNull();
  });

  it('gives every tile a unique key', () => {
    const tiles = buildTiles(answers, ['France', 'France']);
    const keys = tiles.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('works with no decoys', () => {
    expect(buildTiles(answers, []).every((t) => t.answerId !== null)).toBe(true);
  });
});
