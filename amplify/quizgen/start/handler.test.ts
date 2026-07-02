import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  startMapQuiz: vi.fn(),
  startGenerativeQuiz: vi.fn(),
  putItem: vi.fn(),
  batchPut: vi.fn(),
  invokeWorker: vi.fn(),
}));
vi.mock('./startMapQuiz', () => ({ startMapQuiz: e.startMapQuiz }));
vi.mock('./startGenerativeQuiz', () => ({ startGenerativeQuiz: e.startGenerativeQuiz }));
vi.mock('./invokeWorker', () => ({ invokeWorker: e.invokeWorker }));
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
    process.env.WORKER_FUNCTION_NAME = 'worker-fn';
    e.startMapQuiz.mockResolvedValue(undefined);
    e.startGenerativeQuiz.mockResolvedValue(undefined);
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

  it('routes generative modes to the worker path with axis + count', async () => {
    const mcEvent = {
      arguments: {
        mode: 'MULTIPLE_CHOICE',
        topicOrTemplate: 'World Capitals',
        categorySlug: 'geography',
        timeLimitSeconds: 120,
        answerCount: 10,
      },
    } as Parameters<typeof handler>[0];
    const out = await handler(mcEvent, {} as never, {} as never);
    expect(e.startMapQuiz).not.toHaveBeenCalled();
    expect(e.startGenerativeQuiz).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'MULTIPLE_CHOICE',
        topic: 'World Capitals',
        answerCount: 10,
      }),
      expect.objectContaining({ workerFn: 'worker-fn', invokeWorker: e.invokeWorker }),
    );
    expect(out).toHaveProperty('quizId');
  });

  it('defaults answerCount when omitted', async () => {
    const ev = {
      arguments: {
        mode: 'CLASSIC',
        topicOrTemplate: 'Presidents',
        categorySlug: 'history',
        timeLimitSeconds: 120,
      },
    } as Parameters<typeof handler>[0];
    await handler(ev, {} as never, {} as never);
    expect(e.startGenerativeQuiz).toHaveBeenCalledWith(
      expect.objectContaining({ answerCount: 12 }),
      expect.anything(),
    );
  });

  it('throws when a required table env var is missing', async () => {
    delete process.env.QUIZ_TABLE;
    await expect(handler(mapEvent, {} as never, {} as never)).rejects.toThrow(/QUIZ_TABLE not set/);
  });
});
