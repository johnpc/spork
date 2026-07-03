import { describe, it, expect } from 'vitest';
import { verifyMate } from './verifyMate';

describe('verifyMate', () => {
  it('accepts a real mate-in-1 and reports movesToWin + solver side', () => {
    const r = verifyMate({
      name: 'Back rank',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      line: ['a1a8'],
      difficulty: 'EASY',
    });
    expect(r.ok).toBe(true);
    expect(r.puzzle?.movesToWin).toBe(1);
    expect(r.puzzle?.solverSide).toBe('w');
  });

  it('accepts a real mate-in-2 (solver, defender, solver)', () => {
    const r = verifyMate({
      name: 'M2',
      fen: '4r3/1k6/pp3P2/1b5p/3R1p2/P1R2P2/1P4PP/6K1 b - - 0 1',
      line: ['e8e1', 'g1f2', 'e1f1'],
      difficulty: 'MEDIUM',
    });
    expect(r.ok).toBe(true);
    expect(r.puzzle?.movesToWin).toBe(2);
  });

  it('rejects a line whose final move is not checkmate', () => {
    const r = verifyMate({
      name: 'not mate',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      line: ['a1a7'],
      difficulty: 'EASY',
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not checkmate/);
  });

  it('rejects an illegal move', () => {
    const r = verifyMate({
      name: 'illegal',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      line: ['a1a4a9'],
      difficulty: 'EASY',
    });
    expect(r.ok).toBe(false);
  });

  it('rejects an invalid FEN and an even-length line', () => {
    expect(verifyMate({ name: 'x', fen: 'nope', line: ['a1a2'], difficulty: 'EASY' }).ok).toBe(
      false,
    );
    expect(
      verifyMate({
        name: 'x',
        fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
        line: ['a1a2', 'g8g7'],
        difficulty: 'EASY',
      }).ok,
    ).toBe(false);
  });
});
