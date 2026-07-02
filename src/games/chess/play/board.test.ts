import { describe, it, expect } from 'vitest';
import { squares, isLightSquare, pieceAt, glyph } from './board';
import type { Piece } from './chess';

describe('squares', () => {
  it('lists a 5×5 board top rank first, left→right', () => {
    const sq = squares(5);
    expect(sq).toHaveLength(25);
    expect(sq[0]).toBe('a5');
    expect(sq[4]).toBe('e5');
    expect(sq[20]).toBe('a1');
    expect(sq[24]).toBe('e1');
  });
});

describe('isLightSquare', () => {
  it('treats a1 as dark and b1 as light (like a real board)', () => {
    expect(isLightSquare('a1')).toBe(false);
    expect(isLightSquare('b1')).toBe(true);
    expect(isLightSquare('a2')).toBe(true);
  });
});

describe('pieceAt', () => {
  const pieces: Piece[] = [{ sq: 'a1', piece: 'R', side: 'w' }];
  it('finds a piece on a square', () => {
    expect(pieceAt(pieces, 'a1')).toEqual({ sq: 'a1', piece: 'R', side: 'w' });
  });
  it('returns null for an empty square', () => {
    expect(pieceAt(pieces, 'b2')).toBeNull();
  });
});

describe('glyph', () => {
  it('maps side + piece to a unicode glyph', () => {
    expect(glyph({ sq: 'a1', piece: 'R', side: 'w' })).toBe('♖');
    expect(glyph({ sq: 'a5', piece: 'k', side: 'b' })).toBe('♚');
  });
  it('returns empty string for an unknown piece', () => {
    expect(glyph({ sq: 'a1', piece: 'Z', side: 'w' })).toBe('');
  });
});
