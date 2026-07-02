import { describe, it, expect } from 'vitest';
import { legalMove } from './legalMove';
import type { Piece } from '../../../src/games/chess/play/chess';

const W = (piece: string, sq: string): Piece => ({ sq, piece, side: 'w' });
const B = (piece: string, sq: string): Piece => ({ sq, piece, side: 'b' });

describe('legalMove', () => {
  it('rejects a null move (from === to)', () => {
    expect(legalMove([W('R', 'a1')], W('R', 'a1'), 'a1', 'a1')).toBe(false);
  });

  it('rejects capturing your own piece', () => {
    const b = [W('R', 'a1'), W('P', 'a3')];
    expect(legalMove(b, W('R', 'a1'), 'a1', 'a3')).toBe(false);
  });

  it('rook: legal straight, illegal diagonal, blocked path', () => {
    expect(legalMove([W('R', 'a1'), B('K', 'a5')], W('R', 'a1'), 'a1', 'a5')).toBe(true);
    expect(legalMove([W('R', 'a1'), B('K', 'b2')], W('R', 'a1'), 'a1', 'b2')).toBe(false);
    const blocked = [W('R', 'a1'), W('P', 'a3'), B('K', 'a5')];
    expect(legalMove(blocked, W('R', 'a1'), 'a1', 'a5')).toBe(false);
  });

  it('bishop: legal diagonal, illegal straight, blocked path', () => {
    expect(legalMove([W('B', 'a1'), B('K', 'c3')], W('B', 'a1'), 'a1', 'c3')).toBe(true);
    expect(legalMove([W('B', 'a1'), B('K', 'a3')], W('B', 'a1'), 'a1', 'a3')).toBe(false);
    const blocked = [W('B', 'a1'), W('P', 'b2'), B('K', 'c3')];
    expect(legalMove(blocked, W('B', 'a1'), 'a1', 'c3')).toBe(false);
  });

  it('queen: straight and diagonal, but not L-shaped', () => {
    expect(legalMove([W('Q', 'a1'), B('K', 'e5')], W('Q', 'a1'), 'a1', 'e5')).toBe(true);
    expect(legalMove([W('Q', 'a1'), B('K', 'e1')], W('Q', 'a1'), 'a1', 'e1')).toBe(true);
    expect(legalMove([W('Q', 'a1'), B('K', 'b3')], W('Q', 'a1'), 'a1', 'b3')).toBe(false);
  });

  it('knight: L-shape only, jumps over blockers', () => {
    const b = [W('N', 'a1'), W('P', 'a2'), W('P', 'b1'), B('K', 'b3')];
    expect(legalMove(b, W('N', 'a1'), 'a1', 'b3')).toBe(true);
    expect(legalMove([W('N', 'a1'), B('K', 'd4')], W('N', 'a1'), 'a1', 'd4')).toBe(false);
    expect(legalMove([W('N', 'a1'), B('K', 'c2')], W('N', 'a1'), 'a1', 'c2')).toBe(true);
  });

  it('king: one square any direction, not two', () => {
    expect(legalMove([W('K', 'b2'), B('K', 'c3')], W('K', 'b2'), 'b2', 'c3')).toBe(true);
    expect(legalMove([W('K', 'b2'), B('K', 'b4')], W('K', 'b2'), 'b2', 'b4')).toBe(false);
  });

  it('pawn: quiet push onto empty, diagonal only to capture, direction by side', () => {
    // white pushes forward (rank up)
    expect(legalMove([W('P', 'b2')], W('P', 'b2'), 'b2', 'b3')).toBe(true);
    // cannot push onto an occupied square
    expect(legalMove([W('P', 'b2'), B('K', 'b3')], W('P', 'b2'), 'b2', 'b3')).toBe(false);
    // diagonal capture of a foe
    expect(legalMove([W('P', 'b2'), B('K', 'c3')], W('P', 'b2'), 'b2', 'c3')).toBe(true);
    // diagonal onto empty (no capture) illegal
    expect(legalMove([W('P', 'b2')], W('P', 'b2'), 'b2', 'c3')).toBe(false);
    // white cannot move backward
    expect(legalMove([W('P', 'b3')], W('P', 'b3'), 'b3', 'b2')).toBe(false);
    // black moves down the board
    expect(legalMove([B('P', 'b4')], B('P', 'b4'), 'b4', 'b3')).toBe(true);
    expect(legalMove([B('P', 'b4'), W('K', 'c3')], B('P', 'b4'), 'b4', 'c3')).toBe(true);
  });

  it('rejects an unknown piece letter', () => {
    expect(legalMove([W('Z', 'a1'), B('K', 'a5')], W('Z', 'a1'), 'a1', 'a5')).toBe(false);
  });
});
