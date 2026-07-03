import { describe, it, expect } from 'vitest';
import { squares, isLightSquare, pieceAt, glyph } from './board';
import type { BoardPiece } from './chess';

describe('squares', () => {
  it('lists the 8×8 board top rank first, left→right', () => {
    const sq = squares();
    expect(sq).toHaveLength(64);
    expect(sq[0]).toBe('a8');
    expect(sq[7]).toBe('h8');
    expect(sq[56]).toBe('a1');
    expect(sq[63]).toBe('h1');
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
  const pieces: BoardPiece[] = [{ sq: 'a1', type: 'r', color: 'w' }];
  it('finds a piece on a square', () => {
    expect(pieceAt(pieces, 'a1')).toEqual({ sq: 'a1', type: 'r', color: 'w' });
  });
  it('returns null for an empty square', () => {
    expect(pieceAt(pieces, 'b2')).toBeNull();
  });
});

describe('glyph', () => {
  it('maps type to a solid unicode glyph (color is applied via CSS)', () => {
    expect(glyph({ sq: 'a1', type: 'r', color: 'w' })).toBe('♜');
    expect(glyph({ sq: 'a5', type: 'k', color: 'b' })).toBe('♚');
  });
  it('returns empty string for an unknown piece', () => {
    expect(glyph({ sq: 'a1', type: 'z', color: 'w' })).toBe('');
  });
});
