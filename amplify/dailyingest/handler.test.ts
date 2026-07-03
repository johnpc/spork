import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  putItem: vi.fn(),
  batchPut: vi.fn(),
  genQuizAnswers: vi.fn(),
  genLadder: vi.fn(),
  genAcrostic: vi.fn(),
  genQuizzle: vi.fn(),
}));
vi.mock('../deckgen/shared/bedrock', () => ({ invokeText: vi.fn() }));
vi.mock('../deckgen/shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('../quizgen/shared/batchWrite', () => ({ batchPut: e.batchPut }));
vi.mock('./shared/generators', () => ({
  genQuizAnswers: e.genQuizAnswers,
  genLadder: e.genLadder,
  genAcrostic: e.genAcrostic,
  genQuizzle: e.genQuizzle,
}));

import { handler, summarize } from './handler';

describe('daily ingest handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const t of [
      'QUIZ_TABLE',
      'ANSWER_TABLE',
      'WORD_LADDER_TABLE',
      'ACROSTIC_TABLE',
      'QUIZZLE_TABLE',
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
  });

  it('publishes a puzzle for every generative quiz type + each island', async () => {
    await handler();
    // 5 generative quiz types each write a Quiz row + a batch of Answers.
    expect(e.genQuizAnswers).toHaveBeenCalledTimes(5);
    expect(e.batchPut).toHaveBeenCalledTimes(5);
    // 5 quiz-row puts + 3 island puts (steps/acrostic/quizzle) = 8 putItem calls
    // (chess is the curated Lichess set, not daily-generated).
    expect(e.putItem).toHaveBeenCalledTimes(8);
    // Everything written is PUBLISHED and stamped with a puzzleDate.
    for (const [, item] of e.putItem.mock.calls) {
      expect(item.status).toBe('PUBLISHED');
      expect(item.puzzleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('tolerates one game type failing without aborting the rest', async () => {
    e.genQuizzle.mockRejectedValue(new Error('bedrock hiccup'));
    await handler();
    // Quizzle is skipped (its put never happens) but the other 7 still land.
    expect(e.putItem).toHaveBeenCalledTimes(7);
    const quizzleWritten = e.putItem.mock.calls.some(([, i]) => i.__typename === 'Quizzle');
    expect(quizzleWritten).toBe(false);
  });

  it('THROWS when the whole run produces nothing (so the Errors metric fires)', async () => {
    const boom = new Error('bedrock down');
    e.genQuizAnswers.mockRejectedValue(boom);
    e.genLadder.mockRejectedValue(boom);
    e.genAcrostic.mockRejectedValue(boom);
    e.genQuizzle.mockRejectedValue(boom);
    await expect(handler()).rejects.toThrow(/produced NOTHING/);
    expect(e.putItem).not.toHaveBeenCalled();
  });
});

describe('summarize', () => {
  it('does not throw when at least one game was generated', () => {
    expect(() => summarize([true, false, false], '2026-07-03')).not.toThrow();
  });
  it('throws on a total wipeout (0 successes)', () => {
    expect(() => summarize([false, false], '2026-07-03')).toThrow(/produced NOTHING/);
  });
});
