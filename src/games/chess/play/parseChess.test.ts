import { describe, it, expect } from 'vitest';
import { parseFen, parseSolution } from './parseChess';

const VALID = '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1';
const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';

describe('parseFen', () => {
  it('passes through a valid FEN unchanged', () => {
    expect(parseFen(VALID)).toBe(VALID);
  });
  it('degrades to an empty board on bad/empty input', () => {
    expect(parseFen('not a fen')).toBe(EMPTY);
    expect(parseFen(null)).toBe(EMPTY);
    expect(parseFen(undefined)).toBe(EMPTY);
  });
});

describe('parseSolution', () => {
  it('parses a UCI string array', () => {
    expect(parseSolution(JSON.stringify(['e8e1', 'g1f2', 'e1f1']))).toEqual([
      'e8e1',
      'g1f2',
      'e1f1',
    ]);
  });
  it('filters non-strings', () => {
    expect(parseSolution(JSON.stringify(['a1a8', 3, null]))).toEqual(['a1a8']);
  });
  it('degrades to [] on bad/empty input', () => {
    expect(parseSolution('nope')).toEqual([]);
    expect(parseSolution(JSON.stringify({}))).toEqual([]);
    expect(parseSolution(null)).toEqual([]);
  });
});
