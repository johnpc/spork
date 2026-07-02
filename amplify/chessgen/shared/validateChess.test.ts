import { describe, it, expect } from 'vitest';
import { validateChess, type ChessCandidate } from './validateChess';
import type { Position } from '../../../src/games/chess/play/chess';

const pos = (over: Partial<Position> = {}): Position => ({
  size: 5,
  pieces: [
    { sq: 'a1', piece: 'R', side: 'w' },
    { sq: 'a5', piece: 'K', side: 'b' },
  ],
  toMove: 'w',
  goal: 'Capture the black king',
  ...over,
});

const cand = (over: Partial<ChessCandidate> = {}): ChessCandidate => ({
  name: 'Rook Mate',
  position: pos(),
  solution: ['a1a5'],
  movesToWin: 1,
  ...over,
});

describe('validateChess', () => {
  it('accepts a one-move king capture and normalizes movesToWin to solution length', () => {
    const r = validateChess(cand({ movesToWin: 99 }));
    expect(r.ok).toBe(true);
    expect(r.puzzle?.movesToWin).toBe(1);
    expect(r.puzzle?.name).toBe('Rook Mate');
  });

  it('accepts a two-move line where the last move captures the king', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a5', piece: 'P', side: 'b' },
            { sq: 'e5', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1a5', 'a5e5'],
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.puzzle?.solution).toEqual(['a1a5', 'a5e5']);
  });

  it('works when black is to move (enemy is white king)', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'K', side: 'w' },
            { sq: 'a5', piece: 'R', side: 'b' },
          ],
          toMove: 'b',
        }),
        solution: ['a5a1'],
      }),
    );
    expect(r.ok).toBe(true);
  });

  it('rejects a non-5x5 board or a null position', () => {
    expect(validateChess(cand({ position: pos({ size: 8 }) })).reason).toMatch(/5x5/);
    expect(validateChess(cand({ position: undefined as unknown as Position })).reason).toMatch(
      /5x5/,
    );
  });

  it('rejects too few or too many pieces', () => {
    expect(
      validateChess(cand({ position: pos({ pieces: [{ sq: 'a1', piece: 'K', side: 'b' }] }) }))
        .reason,
    ).toMatch(/2–4 pieces/);
    const five = pos({
      pieces: [
        { sq: 'a1', piece: 'R', side: 'w' },
        { sq: 'a5', piece: 'K', side: 'b' },
        { sq: 'b1', piece: 'P', side: 'w' },
        { sq: 'b2', piece: 'P', side: 'w' },
        { sq: 'b3', piece: 'P', side: 'w' },
      ],
    });
    expect(validateChess(cand({ position: five })).reason).toMatch(/2–4 pieces/);
  });

  it('rejects a piece off the board', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'z9', piece: 'R', side: 'w' },
            { sq: 'a5', piece: 'K', side: 'b' },
          ],
        }),
      }),
    );
    expect(r.reason).toMatch(/off board/);
  });

  it('rejects two pieces sharing a square', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a1', piece: 'K', side: 'b' },
          ],
        }),
      }),
    );
    expect(r.reason).toMatch(/share a square/);
  });

  it('rejects when there is no opposing king', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a5', piece: 'Q', side: 'b' },
          ],
        }),
        solution: ['a1a5'],
      }),
    );
    expect(r.reason).toMatch(/no opposing king/);
  });

  it('rejects an empty solution', () => {
    expect(validateChess(cand({ solution: [] })).reason).toMatch(/empty solution/);
  });

  it('rejects a malformed move', () => {
    expect(validateChess(cand({ solution: ['nope'] })).reason).toMatch(/malformed/);
  });

  it('rejects a move referencing an off-board square', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a5', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1a9'],
      }),
    );
    expect(r.reason).toMatch(/off board/);
  });

  it('rejects a move whose from-square has no piece', () => {
    const r = validateChess(cand({ solution: ['b2b3'] }));
    expect(r.reason).toMatch(/no piece on b2/);
  });

  it('rejects when the final move lands on an empty square (no capture)', () => {
    const r = validateChess(cand({ solution: ['a1a3'] }));
    expect(r.reason).toMatch(/does not capture the opposing king/);
  });

  it('rejects when the final move captures a non-king piece', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a3', piece: 'P', side: 'b' },
            { sq: 'a5', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1a3'],
      }),
    );
    expect(r.reason).toMatch(/does not capture the opposing king/);
  });

  it('rejects an ILLEGAL geometric move even though it lands on the enemy king', () => {
    // rook capturing the king diagonally — impossible for a rook, must be rejected
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'b2', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1b2'],
      }),
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/illegal R move/);
  });

  it('rejects a slider that jumps over a blocking piece to reach the king', () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a3', piece: 'P', side: 'w' },
            { sq: 'a5', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1a5'],
      }),
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/illegal R move/);
  });

  it('rejects an intermediate move that is geometrically illegal', () => {
    // first move (knight sliding like a bishop) is illegal; caught before the capture
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'N', side: 'w' },
            { sq: 'e5', piece: 'K', side: 'b' },
          ],
        }),
        solution: ['a1c3', 'c3e5'],
      }),
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/illegal N move/);
  });

  it("rejects when the final move captures the mover's own king", () => {
    const r = validateChess(
      cand({
        position: pos({
          pieces: [
            { sq: 'a1', piece: 'R', side: 'w' },
            { sq: 'a5', piece: 'K', side: 'w' },
          ],
        }),
        solution: ['a1a5'],
      }),
    );
    // white to move, enemy is black — no black king → caught earlier
    expect(r.reason).toMatch(/no opposing king/);
  });
});
