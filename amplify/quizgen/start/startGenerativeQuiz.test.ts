import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startGenerativeQuiz, type GenQuizDeps } from './startGenerativeQuiz';

const input = {
  runId: 'run1',
  quizId: 'q1',
  mode: 'MULTIPLE_CHOICE' as const,
  topic: 'World Capitals',
  categorySlug: 'geography',
  timeLimitSeconds: 120,
  answerCount: 10,
  now: '2026-07-02T00:00:00.000Z',
};

describe('startGenerativeQuiz', () => {
  let deps: GenQuizDeps;
  beforeEach(() => {
    deps = {
      quizTable: 'quizzes',
      runTable: 'runs',
      workerFn: 'worker-fn',
      putItem: vi.fn().mockResolvedValue(undefined),
      invokeWorker: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('creates a DRAFT quiz with axes derived from the mode', async () => {
    await startGenerativeQuiz(input, deps);
    const quiz = (deps.putItem as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === 'quizzes',
    )?.[1];
    expect(quiz).toMatchObject({
      __typename: 'Quiz',
      status: 'DRAFT',
      mode: 'MULTIPLE_CHOICE',
      inputMode: 'PICK',
      scoringMode: 'MEMBERSHIP',
      answerCount: 0,
    });
  });

  it('creates a RUNNING generation run for the Quizzes game', async () => {
    await startGenerativeQuiz(input, deps);
    const run = (deps.putItem as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === 'runs',
    )?.[1];
    expect(run).toMatchObject({
      __typename: 'GenerationRun',
      game: 'QUIZZES',
      mode: 'MULTIPLE_CHOICE',
      status: 'RUNNING',
      requestedCount: 10,
      quizId: 'q1',
    });
  });

  it('async-invokes the worker with the job', async () => {
    await startGenerativeQuiz(input, deps);
    expect(deps.invokeWorker).toHaveBeenCalledWith('worker-fn', {
      runId: 'run1',
      quizId: 'q1',
      mode: 'MULTIPLE_CHOICE',
      topic: 'World Capitals',
      answerCount: 10,
    });
  });
});
