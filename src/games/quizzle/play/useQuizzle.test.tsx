import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import type { KeyValueStore } from './bestBankStore';

const api = vi.hoisted(() => ({ fetchQuizzle: vi.fn() }));
vi.mock('./quizzleApi', () => api);

import { useQuizzle } from './useQuizzle';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function memStore(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const quizzle = {
  id: 'q1',
  topic: 'Capitals',
  startingBank: 1000,
  questions: JSON.stringify([
    { question: 'Capital of France?', answer: 'Paris' },
    { question: 'Capital of Japan?', answer: 'Tokyo' },
  ]),
};

describe('useQuizzle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchQuizzle.mockResolvedValue(quizzle);
  });

  it('loads the quizzle with parsed questions and starting bank', async () => {
    const { result } = renderHook(() => useQuizzle('q1', memStore()), { wrapper });
    await waitFor(() => expect(result.current.topic).toBe('Capitals'));
    expect(result.current.total).toBe(2);
    expect(result.current.bank).toBe(1000);
    expect(result.current.started).toBe(false);
  });

  it('plays a correct wagered answer and grows the bank', async () => {
    const { result } = renderHook(() => useQuizzle('q1', memStore()), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    act(() => result.current.start());
    act(() => result.current.wager(500));
    expect(result.current.stage).toBe('answer');
    act(() => result.current.answer('paris'));
    expect(result.current.lastCorrect).toBe(true);
    expect(result.current.bank).toBe(1500);
  });

  it('advances to done and persists the best bank', async () => {
    const store = memStore();
    const { result } = renderHook(() => useQuizzle('q1', store), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    act(() => result.current.start());
    act(() => result.current.wager(500));
    act(() => result.current.answer('paris'));
    act(() => result.current.advance());
    act(() => result.current.wager(100));
    act(() => result.current.answer('wrong'));
    act(() => result.current.advance());
    expect(result.current.done).toBe(true);
    expect(result.current.bank).toBe(1400);
    expect(result.current.best).toBe(1400);
  });

  it('reports loading and no quizzle without an id', () => {
    const { result } = renderHook(() => useQuizzle(undefined, memStore()), { wrapper });
    expect(result.current.quizzle).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
