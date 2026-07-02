import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ getQuiz: vi.fn(), listAnswers: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: {
    models: {
      Quiz: { get: m.getQuiz },
      Answer: { listAnswerByQuizIdAndOrd: m.listAnswers },
    },
  },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchQuizData } from './playApi';

describe('fetchQuizData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the quiz and its ordered answers (public read)', async () => {
    m.getQuiz.mockResolvedValue({ data: { id: 'q1', mode: 'MAP' } });
    m.listAnswers.mockResolvedValue({ data: [{ id: 'a1' }] });
    const out = await fetchQuizData('q1');
    expect(out.quiz).toEqual({ id: 'q1', mode: 'MAP' });
    expect(out.answers).toEqual([{ id: 'a1' }]);
    expect(m.listAnswers).toHaveBeenCalledWith(
      { quizId: 'q1' },
      { limit: 1000, authMode: 'identityPool' },
    );
  });
});
