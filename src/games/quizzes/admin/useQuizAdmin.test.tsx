import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({
  generateQuiz: vi.fn(),
  fetchQuizRuns: vi.fn(),
  fetchDraftQuizzes: vi.fn(),
  publishQuiz: vi.fn(),
}));
vi.mock('./quizGenApi', () => api);

import { useQuizAdmin } from './useQuizAdmin';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useQuizAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchQuizRuns.mockResolvedValue([{ id: 'r1', status: 'DRAFT_READY', topic: 'X' }]);
    api.fetchDraftQuizzes.mockResolvedValue([{ id: 'q1', topic: 'X', mode: 'CLASSIC' }]);
    api.generateQuiz.mockResolvedValue({ runId: 'r2', quizId: 'q2' });
    api.publishQuiz.mockResolvedValue(undefined);
  });

  it('exposes runs + drafts once loaded', async () => {
    const { result } = renderHook(() => useQuizAdmin(), { wrapper });
    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));
  });

  it('generate calls the api', async () => {
    const { result } = renderHook(() => useQuizAdmin(), { wrapper });
    await act(async () => {
      await result.current.generate({
        mode: 'CLASSIC',
        topicOrTemplate: 'T',
        categorySlug: 'history',
        timeLimitSeconds: 120,
        answerCount: 8,
      });
    });
    expect(api.generateQuiz).toHaveBeenCalled();
  });

  it('publish calls the api with the quiz id', async () => {
    const { result } = renderHook(() => useQuizAdmin(), { wrapper });
    await act(async () => {
      await result.current.publish('q1');
    });
    expect(api.publishQuiz).toHaveBeenCalledWith('q1');
  });
});
