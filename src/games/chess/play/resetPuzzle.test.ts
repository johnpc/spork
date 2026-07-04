import { describe, it, expect } from 'vitest';
import { initialState } from './resetPuzzle';

describe('initialState', () => {
  it('returns a fresh puzzle state with the given FEN', () => {
    const fen = '6k1/8/8/8/8/8/8/R5K1 w - - 0 1';
    const state = initialState(fen);
    expect(state).toEqual({
      fen,
      ply: 0,
      selected: null,
      wrong: false,
      solved: false,
      gaveUp: false,
    });
  });
});
