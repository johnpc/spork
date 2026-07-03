import { describe, it, expect } from 'vitest';
import { seedChessPuzzles } from './chess';
import { verifyMate } from '../../chessgen/shared/verifyMate';

/** The committed chess fixtures must each be a REAL forced mate — re-verify the
 * shipped data with chess.js so a bad edit/regeneration can never ship. */
describe('seedChessPuzzles integrity', () => {
  it('ships a graded spread of mate puzzles', () => {
    expect(seedChessPuzzles.length).toBeGreaterThanOrEqual(4);
    expect(seedChessPuzzles.map((p) => p.movesToWin)).toContain(1);
    expect(seedChessPuzzles.map((p) => p.movesToWin)).toContain(2);
  });

  for (const p of seedChessPuzzles) {
    it(`"${p.name}" is a verified mate in ${p.movesToWin}`, () => {
      const r = verifyMate({
        name: p.name,
        fen: p.position,
        line: JSON.parse(p.solution),
        difficulty: p.difficulty,
      });
      expect(r.ok, r.reason).toBe(true);
      expect(r.puzzle?.movesToWin).toBe(p.movesToWin);
    });
  }
});
