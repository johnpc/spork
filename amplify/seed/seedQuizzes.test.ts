import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ quizCreate: vi.fn(), answerCreate: vi.fn() }));
vi.mock('./seedClient', () => ({
  client: { models: { Quiz: { create: m.quizCreate }, Answer: { create: m.answerCreate } } },
  EDITOR_WRITE: { authMode: 'userPool' },
}));

import { seedQuizData } from './seedQuizzes';
import { WORLD_COUNTRIES } from '../quizgen/fixtures/worldCountries';

describe('seedQuizData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.quizCreate.mockResolvedValue({ data: { id: 'quiz1' }, errors: null });
    m.answerCreate.mockResolvedValue({ errors: null });
  });

  it('creates the World Countries quiz as a PUBLISHED MAP quiz', async () => {
    const count = await seedQuizData();
    expect(count).toBe(1);
    expect(m.quizCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'World Countries',
        mode: 'MAP',
        status: 'PUBLISHED',
        answerCount: WORLD_COUNTRIES.length,
      }),
      { authMode: 'userPool' },
    );
  });

  it('creates one Answer per fixture country, keyed to the quiz', async () => {
    await seedQuizData();
    expect(m.answerCreate).toHaveBeenCalledTimes(WORLD_COUNTRIES.length);
    expect(m.answerCreate).toHaveBeenCalledWith(
      expect.objectContaining({ quizId: 'quiz1', ord: WORLD_COUNTRIES[0].ord }),
      { authMode: 'userPool' },
    );
  });

  it('throws when the quiz create returns errors', async () => {
    m.quizCreate.mockResolvedValueOnce({ data: null, errors: [{ message: 'denied' }] });
    await expect(seedQuizData()).rejects.toThrow(/Quiz/);
  });

  it('throws when an answer create returns errors', async () => {
    m.answerCreate.mockResolvedValue({ errors: [{ message: 'bad' }] });
    await expect(seedQuizData()).rejects.toThrow(/Answer/);
  });
});
