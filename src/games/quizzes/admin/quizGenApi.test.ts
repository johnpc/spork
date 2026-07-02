import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ generateQuiz: vi.fn(), list: vi.fn(), update: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: {
    mutations: { generateQuiz: m.generateQuiz },
    models: { Quiz: { list: m.list, update: m.update }, GenerationRun: { list: m.list } },
  },
}));

import { generateQuiz, fetchQuizRuns, fetchDraftQuizzes, publishQuiz } from './quizGenApi';

const input = {
  mode: 'CLASSIC',
  topicOrTemplate: 'Presidents',
  categorySlug: 'history',
  timeLimitSeconds: 120,
  answerCount: 8,
};

describe('generateQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns run + quiz ids', async () => {
    m.generateQuiz.mockResolvedValue({ data: { runId: 'r1', quizId: 'q1' }, errors: null });
    expect(await generateQuiz(input)).toEqual({ runId: 'r1', quizId: 'q1' });
    expect(m.generateQuiz).toHaveBeenCalledWith(input, { authMode: 'userPool' });
  });
  it('throws on errors', async () => {
    m.generateQuiz.mockResolvedValue({ data: null, errors: [{ message: 'nope' }] });
    await expect(generateQuiz(input)).rejects.toThrow('nope');
  });
});

describe('fetchQuizRuns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('keeps only QUIZZES-game runs, newest first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', game: 'QUIZZES', startedAt: '2026-01-01' },
        { id: 'b', game: 'FLASHCARDS', startedAt: '2026-02-01' },
        { id: 'c', game: 'QUIZZES', startedAt: '2026-03-01' },
      ],
    });
    const out = await fetchQuizRuns();
    expect(out.map((r) => r.id)).toEqual(['c', 'a']);
  });
});

describe('fetchDraftQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('keeps only DRAFT quizzes, newest first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', createdAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT', createdAt: '2026-02-01' },
        { id: 'c', status: 'DRAFT', createdAt: '2026-03-01' },
      ],
    });
    const out = await fetchDraftQuizzes();
    expect(out.map((q) => q.id)).toEqual(['c', 'b']);
  });
});

describe('publishQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('flips status to PUBLISHED with publishedAt', async () => {
    m.update.mockResolvedValue({ errors: null });
    await publishQuiz('q1', new Date('2026-07-02T00:00:00.000Z'));
    expect(m.update).toHaveBeenCalledWith(
      { id: 'q1', status: 'PUBLISHED', publishedAt: '2026-07-02T00:00:00.000Z' },
      { authMode: 'userPool' },
    );
  });
  it('throws on errors', async () => {
    m.update.mockResolvedValue({ errors: [{ message: 'denied' }] });
    await expect(publishQuiz('q1')).rejects.toThrow('denied');
  });
});
