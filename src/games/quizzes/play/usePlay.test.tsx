import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchQuizData: vi.fn() }));
vi.mock('./playApi', () => api);
vi.mock('./useRecordBestScore', () => ({ useRecordBestScore: vi.fn() }));

import { usePlay } from './usePlay';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const quizData = {
  quiz: { id: 'q1', mode: 'MAP', timeLimitSeconds: 300 },
  answers: [
    { id: 'a1', regionId: '076', accepted: JSON.stringify(['Brazil', 'BR']) },
    { id: 'a2', regionId: '840', accepted: JSON.stringify(['United States', 'USA']) },
  ],
};

describe('usePlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchQuizData.mockResolvedValue(quizData);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the quiz + answers and starts idle', async () => {
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await waitFor(() => expect(result.current.quiz?.id).toBe('q1'));
    expect(result.current.status).toBe('idle');
    expect(result.current.score).toEqual({ found: 0, total: 2 });
  });

  it('matches a guess after start, marking it found', async () => {
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await waitFor(() => expect(result.current.score.total).toBe(2));
    act(() => result.current.start());
    let hit = false;
    act(() => {
      hit = result.current.submit('brazil');
    });
    expect(hit).toBe(true);
    expect(result.current.found.has('a1')).toBe(true);
    expect(result.current.score.found).toBe(1);
  });

  it('ignores a duplicate or unknown guess', async () => {
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await waitFor(() => expect(result.current.score.total).toBe(2));
    act(() => result.current.start());
    act(() => void result.current.submit('USA'));
    let second = true;
    act(() => {
      second = result.current.submit('usa'); // duplicate
    });
    expect(second).toBe(false);
    expect(result.current.submit).toBeDefined();
    act(() => {
      expect(result.current.submit('atlantis')).toBe(false); // unknown
    });
  });

  it('completes when all answers are found', async () => {
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await waitFor(() => expect(result.current.score.total).toBe(2));
    act(() => result.current.start());
    act(() => void result.current.submit('Brazil'));
    act(() => void result.current.submit('United States'));
    expect(result.current.status).toBe('done');
  });

  it('ends the session early on give up', async () => {
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await waitFor(() => expect(result.current.score.total).toBe(2));
    act(() => result.current.start());
    act(() => result.current.giveUp());
    expect(result.current.status).toBe('done');
  });

  it('ends the session when the timer expires', async () => {
    vi.useFakeTimers();
    const short = { ...quizData, quiz: { ...quizData.quiz, timeLimitSeconds: 1 } };
    api.fetchQuizData.mockResolvedValue(short);
    const { result } = renderHook(() => usePlay('q1'), { wrapper });
    await vi.waitFor(() => expect(result.current.score.total).toBe(2));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.status).toBe('done');
  });
});
