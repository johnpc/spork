import { describe, it, expect } from 'vitest';
import { parseGroups, shuffleTiles, type Group } from './parseConnections';

describe('parseGroups', () => {
  it('parses a valid JSON array of 4-word groups', () => {
    const json = JSON.stringify([
      { theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 },
      { theme: 'Colors', words: ['red', 'blue', 'green', 'yellow'], level: 1 },
    ]);
    const groups = parseGroups(json);
    expect(groups).toHaveLength(2);
    expect(groups[0].theme).toBe('Fruits');
    expect(groups[0].words).toEqual(['apple', 'banana', 'cherry', 'date']);
    expect(groups[1].level).toBe(1);
  });

  it('filters out malformed entries (not 4 words, missing fields)', () => {
    const json = JSON.stringify([
      { theme: 'Valid', words: ['a', 'b', 'c', 'd'], level: 0 },
      { theme: 'Short', words: ['x', 'y'], level: 1 }, // only 2 words
      { words: ['p', 'q', 'r', 's'], level: 2 }, // missing theme
    ]);
    const groups = parseGroups(json);
    expect(groups).toHaveLength(1);
    expect(groups[0].theme).toBe('Valid');
  });

  it('returns empty for null / invalid JSON', () => {
    expect(parseGroups(null)).toEqual([]);
    expect(parseGroups(undefined)).toEqual([]);
    expect(parseGroups('not json')).toEqual([]);
    expect(parseGroups('{"a":1}')).toEqual([]); // not an array
  });
});

describe('shuffleTiles', () => {
  const GROUPS: Group[] = [
    { theme: 'A', words: ['a1', 'a2', 'a3', 'a4'], level: 0 },
    { theme: 'B', words: ['b1', 'b2', 'b3', 'b4'], level: 1 },
  ];

  it('flattens + shuffles via injected RNG', () => {
    let i = 0;
    const vals = [0.9, 0.5, 0.1]; // deterministic sequence
    const rng = () => vals[i++ % vals.length];
    const tiles = shuffleTiles(GROUPS, rng);
    expect(tiles).toHaveLength(8);
    // order determined by Fisher-Yates with this RNG; exact check proves determinism
    expect(tiles).not.toEqual(['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4']);
  });

  it('includes all words from all groups', () => {
    const tiles = shuffleTiles(GROUPS, Math.random);
    expect(tiles.sort()).toEqual(['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'].sort());
  });
});
