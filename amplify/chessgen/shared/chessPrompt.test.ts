import { describe, it, expect } from 'vitest';
import { buildChessRequest } from './chessPrompt';

describe('buildChessRequest', () => {
  it('forces the make_chess_puzzle tool', () => {
    const body = JSON.parse(buildChessRequest({ difficulty: 'EASY' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'make_chess_puzzle' });
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['name', 'position', 'solution', 'movesToWin']),
    );
  });
  it('encodes difficulty as a move count in the prompt', () => {
    expect(JSON.parse(buildChessRequest({ difficulty: 'EASY' })).system).toContain('1 move');
    expect(JSON.parse(buildChessRequest({ difficulty: 'MEDIUM' })).system).toContain('2 moves');
    const hard = JSON.parse(buildChessRequest({ difficulty: 'HARD' }));
    expect(hard.system).toContain('3 moves');
    expect(hard.messages[0].content).toContain('hard');
  });
});
