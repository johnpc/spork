import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  putItem: vi.fn(),
  batchPut: vi.fn(),
  genQuizAnswers: vi.fn(),
  genLadder: vi.fn(),
  genAcrostic: vi.fn(),
  genQuizzle: vi.fn(),
  genChess: vi.fn(),
}));
vi.mock('../deckgen/shared/bedrock', () => ({ invokeText: vi.fn() }));
vi.mock('../deckgen/shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('../quizgen/shared/batchWrite', () => ({ batchPut: e.batchPut }));
vi.mock('./shared/generators', () => ({
  genQuizAnswers: e.genQuizAnswers,
  genLadder: e.genLadder,
  genAcrostic: e.genAcrostic,
  genQuizzle: e.genQuizzle,
  genChess: e.genChess,
}));

import { handler } from './handler';

describe('daily ingest handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const t of [
      'QUIZ_TABLE',
      'ANSWER_TABLE',
      'WORD_LADDER_TABLE',
      'ACROSTIC_TABLE',
      'QUIZZLE_TABLE',
      'CHESS_ATTACK_TABLE',
    ])
      process.env[t] = t.toLowerCase();
    e.genQuizAnswers.mockResolvedValue([
      { promptKind: 'NONE', display: 'Tokyo', accepted: ['Tokyo'] },
    ]);
    e.genLadder.mockResolvedValue({
      start: 'cat',
      target: 'dog',
      parPath: ['cat', 'dog'],
      dictionary: ['cat', 'dog'],
    });
    e.genAcrostic.mockResolvedValue({
      title: 't',
      quote: 'q',
      author: 'a',
      clues: [{ clue: 'c', answer: 'o' }],
    });
    e.genQuizzle.mockResolvedValue({ topic: 'Geo', questions: [{ q: 1 }] });
    e.genChess.mockResolvedValue({
      name: 'M',
      position: { size: 5, pieces: [] },
      solution: ['a1a2'],
      movesToWin: 1,
    });
  });

  it('publishes a puzzle for every generative quiz type + each island', async () => {
    await handler();
    // 5 generative quiz types each write a Quiz row + a batch of Answers.
    expect(e.genQuizAnswers).toHaveBeenCalledTimes(5);
    expect(e.batchPut).toHaveBeenCalledTimes(5);
    // 5 quiz-row puts + 4 island puts = 9 putItem calls.
    expect(e.putItem).toHaveBeenCalledTimes(9);
    // Everything written is PUBLISHED and stamped with a puzzleDate.
    for (const [, item] of e.putItem.mock.calls) {
      expect(item.status).toBe('PUBLISHED');
      expect(item.puzzleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('tolerates one game type failing without aborting the rest', async () => {
    e.genChess.mockRejectedValue(new Error('bedrock hiccup'));
    await handler();
    // Chess is skipped (its put never happens) but the other 8 still land.
    expect(e.putItem).toHaveBeenCalledTimes(8);
    const chessWritten = e.putItem.mock.calls.some(([, i]) => i.__typename === 'ChessAttack');
    expect(chessWritten).toBe(false);
  });
});
