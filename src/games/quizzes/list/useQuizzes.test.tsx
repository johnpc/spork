import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchPublishedQuizzes: vi.fn() }));
vi.mock('./quizListApi', () => api);

import { useQuizzes } from './useQuizzes';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched quizzes', async () => {
    api.fetchPublishedQuizzes.mockResolvedValue([{ id: 'q1' }]);
    const { result } = renderHook(() => useQuizzes(), { wrapper });
    await waitFor(() => expect(result.current.quizzes).toHaveLength(1));
    expect(result.current.quizzes[0].id).toBe('q1');
  });

  it('defaults to an empty list before load', () => {
    api.fetchPublishedQuizzes.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useQuizzes(), { wrapper });
    expect(result.current.quizzes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
