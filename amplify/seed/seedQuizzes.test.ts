import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ quizCreate: vi.fn(), answerCreate: vi.fn() }));
vi.mock('./seedClient', () => ({
  client: { models: { Quiz: { create: m.quizCreate }, Answer: { create: m.answerCreate } } },
  EDITOR_WRITE: { authMode: 'userPool' },
}));

import { seedQuizData } from './seedQuizzes';
import { SEED_QUIZZES } from './fixtures/quizzes';

describe('seedQuizData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.quizCreate.mockResolvedValue({ data: { id: 'quiz1' }, errors: null });
    m.answerCreate.mockResolvedValue({ errors: null });
  });

  it('creates one PUBLISHED quiz per registered fixture with all three axes', async () => {
    const count = await seedQuizData();
    expect(count).toBe(SEED_QUIZZES.length);
    expect(m.quizCreate).toHaveBeenCalledTimes(SEED_QUIZZES.length);
    const first = m.quizCreate.mock.calls[0][0];
    expect(first).toMatchObject({ status: 'PUBLISHED' });
    expect(first.mode).toBeDefined();
    expect(first.inputMode).toBeDefined();
    expect(first.scoringMode).toBeDefined();
  });

  it('creates an Answer per fixture answer, keyed to the quiz', async () => {
    await seedQuizData();
    const totalAnswers = SEED_QUIZZES.reduce((n, q) => n + q.answers.length, 0);
    expect(m.answerCreate).toHaveBeenCalledTimes(totalAnswers);
    expect(m.answerCreate.mock.calls[0][0]).toMatchObject({ quizId: 'quiz1', ord: 0 });
  });

  it('throws when a quiz create returns errors', async () => {
    m.quizCreate.mockResolvedValueOnce({ data: null, errors: [{ message: 'denied' }] });
    await expect(seedQuizData()).rejects.toThrow(/Quiz/);
  });

  it('throws when an answer create returns errors', async () => {
    m.answerCreate.mockResolvedValue({ errors: [{ message: 'bad' }] });
    await expect(seedQuizData()).rejects.toThrow(/Answer/);
  });
});
