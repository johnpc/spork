import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ startMapQuiz: vi.fn(), putItem: vi.fn(), batchPut: vi.fn() }));
vi.mock('./startMapQuiz', () => ({ startMapQuiz: e.startMapQuiz }));
vi.mock('../../deckgen/shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('../shared/batchWrite', () => ({ batchPut: e.batchPut }));

import { handler } from './handler';

const mapEvent = {
  arguments: {
    mode: 'MAP',
    topicOrTemplate: 'world-countries',
    categorySlug: 'geography',
    timeLimitSeconds: 600,
  },
} as Parameters<typeof handler>[0];

describe('generateQuiz starter handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.QUIZ_TABLE = 'quizzes';
    process.env.ANSWER_TABLE = 'answers';
    process.env.GENERATION_RUN_TABLE = 'runs';
    e.startMapQuiz.mockResolvedValue(undefined);
  });

  it('forks MAP to the template path and returns ids', async () => {
    const out = await handler(mapEvent, {} as never, {} as never);
    expect(out).toHaveProperty('runId');
    expect(out).toHaveProperty('quizId');
    expect(e.startMapQuiz).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'world-countries',
        categorySlug: 'geography',
        timeLimitSeconds: 600,
        runId: out?.runId,
        quizId: out?.quizId,
      }),
      { quizTable: 'quizzes', answerTable: 'answers', runTable: 'runs' },
      expect.objectContaining({ putItem: e.putItem, batchPut: e.batchPut }),
    );
  });

  it('rejects generative modes (worker path deferred this slice)', async () => {
    const typingEvent = {
      arguments: { ...mapEvent.arguments, mode: 'TYPING' },
    } as Parameters<typeof handler>[0];
    await expect(handler(typingEvent, {} as never, {} as never)).rejects.toThrow(
      /not yet supported/,
    );
    expect(e.startMapQuiz).not.toHaveBeenCalled();
  });

  it('throws when a required table env var is missing', async () => {
    delete process.env.QUIZ_TABLE;
    await expect(handler(mapEvent, {} as never, {} as never)).rejects.toThrow(/QUIZ_TABLE not set/);
  });
});
