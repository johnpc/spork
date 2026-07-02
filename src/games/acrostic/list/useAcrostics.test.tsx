import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchAcrostics: vi.fn() }));
vi.mock('../play/acrosticApi', () => api);

import { useAcrostics } from './useAcrostics';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useAcrostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched acrostics', async () => {
    api.fetchAcrostics.mockResolvedValue([{ id: 'a1' }]);
    const { result } = renderHook(() => useAcrostics(), { wrapper });
    await waitFor(() => expect(result.current.acrostics).toHaveLength(1));
  });

  it('defaults to empty before load', () => {
    api.fetchAcrostics.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAcrostics(), { wrapper });
    expect(result.current.acrostics).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
