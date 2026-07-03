import { describe, it, expect } from 'vitest';
import { boardFromFen, turnOf, legalTargets, playSolverMove } from './chess';

// Back-rank mate-in-1: 1.Ra8#
const M1 = '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1';
// Verified mate-in-2 (from the Lichess fixture): 1...Re1+ 2.Kf2 Rf1#
const M2_FEN = '4r3/1k6/pp3P2/1b5p/3R1p2/P1R2P2/1P4PP/6K1 b - - 0 1';
const M2_LINE = ['e8e1', 'g1f2', 'e1f1'];

describe('boardFromFen + turnOf', () => {
  it('reads the occupied squares and side to move', () => {
    const pieces = boardFromFen(M1);
    expect(pieces).toContainEqual({ sq: 'a1', type: 'r', color: 'w' });
    expect(pieces).toContainEqual({ sq: 'g8', type: 'k', color: 'b' });
    expect(turnOf(M1)).toBe('w');
  });
  it('degrades to empty on a bad FEN', () => {
    expect(boardFromFen('nonsense')).toEqual([]);
  });
});

describe('legalTargets', () => {
  it('lists a rook’s legal destinations (incl. the mating square)', () => {
    const t = legalTargets(M1, 'a1');
    expect(t).toContain('a8'); // the mate
    expect(t).not.toContain('b2'); // off the rook's lines
  });
});

describe('playSolverMove', () => {
  it('accepts the expected move and reports checkmate (mate in 1)', () => {
    const r = playSolverMove(M1, ['a1a8'], 0, 'a1', 'a8');
    expect(r.ok).toBe(true);
    expect(r.solved).toBe(true);
  });

  it('rejects a wrong move and leaves the position unchanged', () => {
    const r = playSolverMove(M1, ['a1a8'], 0, 'g1', 'g2');
    expect(r.ok).toBe(false);
    expect(r.solved).toBe(false);
    expect(r.fen).toBe(M1);
  });

  it('auto-plays the defender reply between solver moves (mate in 2)', () => {
    const r1 = playSolverMove(M2_FEN, M2_LINE, 0, 'e8', 'e1');
    expect(r1.ok).toBe(true);
    expect(r1.solved).toBe(false);
    expect(r1.fen).not.toBe(M2_FEN); // defender moved too
    const r2 = playSolverMove(r1.fen, M2_LINE, 2, 'e1', 'f1');
    expect(r2.ok).toBe(true);
    expect(r2.solved).toBe(true);
  });
});
