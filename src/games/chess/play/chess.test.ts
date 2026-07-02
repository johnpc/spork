import { describe, it, expect } from 'vitest';
import { splitMove, applyMove, isExpectedMove, isSolved, type Piece } from './chess';

const board: Piece[] = [
  { sq: 'a1', piece: 'R', side: 'w' },
  { sq: 'a5', piece: 'K', side: 'b' },
];

describe('splitMove', () => {
  it('splits a coordinate move into from/to', () => {
    expect(splitMove('a1a5')).toEqual({ from: 'a1', to: 'a5' });
  });
  it('is case + whitespace tolerant', () => {
    expect(splitMove('  A1A5 ')).toEqual({ from: 'a1', to: 'a5' });
  });
  it('rejects malformed moves', () => {
    expect(splitMove('a1')).toBeNull();
    expect(splitMove('zz')).toBeNull();
  });
});

describe('applyMove', () => {
  it('relocates the mover and captures the occupant', () => {
    const out = applyMove(board, 'a1a5');
    expect(out).toEqual([{ sq: 'a5', piece: 'R', side: 'w' }]);
  });
  it('moves to an empty square without capture', () => {
    const out = applyMove(board, 'a1a3');
    expect(out).toContainEqual({ sq: 'a3', piece: 'R', side: 'w' });
    expect(out).toContainEqual({ sq: 'a5', piece: 'K', side: 'b' });
  });
  it('does not mutate the input array', () => {
    const copy = [...board];
    applyMove(board, 'a1a5');
    expect(board).toEqual(copy);
  });
  it('leaves the board unchanged for a malformed move', () => {
    expect(applyMove(board, 'nope')).toBe(board);
  });
  it('leaves the board unchanged when from is empty', () => {
    expect(applyMove(board, 'b1b2')).toBe(board);
  });
});

describe('isExpectedMove', () => {
  const sol = ['a1a5', 'a5e5'];
  it('matches the next solution step', () => {
    expect(isExpectedMove(sol, 0, 'a1a5')).toBe(true);
    expect(isExpectedMove(sol, 1, 'A5E5')).toBe(true);
  });
  it('rejects a wrong move', () => {
    expect(isExpectedMove(sol, 0, 'a1a2')).toBe(false);
  });
  it('rejects when index is past the solution', () => {
    expect(isExpectedMove(sol, 2, 'a1a5')).toBe(false);
  });
});

describe('isSolved', () => {
  it('is solved once every move is played', () => {
    expect(isSolved(['a1a5'], 1)).toBe(true);
    expect(isSolved(['a1a5', 'a5e5'], 2)).toBe(true);
  });
  it('is not solved partway or with an empty solution', () => {
    expect(isSolved(['a1a5', 'a5e5'], 1)).toBe(false);
    expect(isSolved([], 0)).toBe(false);
  });
});
