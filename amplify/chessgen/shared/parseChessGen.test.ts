import { describe, it, expect } from 'vitest';
import { parseChessGen } from './parseChessGen';

const position = {
  size: 5,
  pieces: [
    { sq: 'a1', piece: 'R', side: 'w' },
    { sq: 'a5', piece: 'K', side: 'b' },
  ],
  toMove: 'w',
  goal: 'Capture the black king',
};

const block = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'make_chess_puzzle', input }],
});

describe('parseChessGen', () => {
  it('extracts the candidate and parses the position', () => {
    const c = parseChessGen(
      block({ name: 'Rook Mate', position, solution: ['a1a5'], movesToWin: 1 }),
    );
    expect(c.name).toBe('Rook Mate');
    expect(c.position.pieces).toHaveLength(2);
    expect(c.position.toMove).toBe('w');
    expect(c.solution).toEqual(['a1a5']);
    expect(c.movesToWin).toBe(1);
  });

  it('drops non-string solution entries and defaults movesToWin to solution length', () => {
    const c = parseChessGen(block({ name: 'x', position, solution: ['a1a5', 7, null] }));
    expect(c.solution).toEqual(['a1a5']);
    expect(c.movesToWin).toBe(1);
  });

  it('degrades a missing/malformed position to an empty board', () => {
    const c = parseChessGen(block({ name: 'x', solution: [] }));
    expect(c.position.pieces).toEqual([]);
    expect(c.position.size).toBe(5);
  });

  it('treats a non-array solution as empty', () => {
    expect(parseChessGen(block({ name: 'x', solution: 'a1a5' })).solution).toEqual([]);
  });

  it('falls back to {} when the tool block has no input (then throws for missing name)', () => {
    expect(() =>
      parseChessGen({ content: [{ type: 'tool_use', name: 'make_chess_puzzle' }] }),
    ).toThrow(/missing name/);
  });

  it('throws without the tool block or name', () => {
    expect(() => parseChessGen({ content: [{ type: 'text' }] })).toThrow(/no make_chess_puzzle/);
    expect(() => parseChessGen(block({ position }))).toThrow(/missing name/);
  });
});
