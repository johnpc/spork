import { describe, it, expect } from 'vitest';
import { parsePosition, parseSolution } from './parseChess';

describe('parsePosition', () => {
  it('parses a well-formed position', () => {
    const json = JSON.stringify({
      size: 5,
      pieces: [{ sq: 'a1', piece: 'R', side: 'w' }],
      toMove: 'b',
      goal: 'win',
    });
    expect(parsePosition(json)).toEqual({
      size: 5,
      pieces: [{ sq: 'a1', piece: 'R', side: 'w' }],
      toMove: 'b',
      goal: 'win',
    });
  });

  it('drops malformed pieces and defaults missing fields', () => {
    const json = JSON.stringify({
      pieces: [{ sq: 'a1', piece: 'R', side: 'w' }, { sq: 'b2' }, { side: 'x' }, 42],
    });
    const pos = parsePosition(json);
    expect(pos.pieces).toEqual([{ sq: 'a1', piece: 'R', side: 'w' }]);
    expect(pos.size).toBe(5);
    expect(pos.toMove).toBe('w');
    expect(pos.goal).toBe('');
  });

  it('rejects a piece with a bad side value', () => {
    const json = JSON.stringify({ pieces: [{ sq: 'a1', piece: 'R', side: 'x' }] });
    expect(parsePosition(json).pieces).toEqual([]);
  });

  it('treats a non-array pieces field as empty', () => {
    const json = JSON.stringify({ pieces: 'oops', size: 5 });
    expect(parsePosition(json).pieces).toEqual([]);
  });

  it('degrades to an empty board on bad/empty input', () => {
    const empty = { size: 5, pieces: [], toMove: 'w', goal: '' };
    expect(parsePosition('not json')).toEqual(empty);
    expect(parsePosition('123')).toEqual(empty);
    expect(parsePosition(null)).toEqual(empty);
    expect(parsePosition(undefined)).toEqual(empty);
  });
});

describe('parseSolution', () => {
  it('parses a string array', () => {
    expect(parseSolution(JSON.stringify(['a1a5', 'a5e5']))).toEqual(['a1a5', 'a5e5']);
  });
  it('filters non-strings', () => {
    expect(parseSolution(JSON.stringify(['a1a5', 3, null]))).toEqual(['a1a5']);
  });
  it('degrades to [] on bad/empty input', () => {
    expect(parseSolution('nope')).toEqual([]);
    expect(parseSolution(JSON.stringify({}))).toEqual([]);
    expect(parseSolution(null)).toEqual([]);
  });
});
