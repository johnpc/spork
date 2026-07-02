import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const currentGroups = vi.hoisted(() => vi.fn());
vi.mock('../auth/authClient', () => ({ currentGroups }));

import { useIsEditor } from './useIsEditor';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useIsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is true when the user is in the editors group', async () => {
    currentGroups.mockResolvedValue(['editors']);
    const { result } = renderHook(() => useIsEditor(), { wrapper });
    await waitFor(() => expect(result.current.isEditor).toBe(true));
  });

  it('is false when the user is not an editor', async () => {
    currentGroups.mockResolvedValue([]);
    const { result } = renderHook(() => useIsEditor(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEditor).toBe(false);
  });
});
