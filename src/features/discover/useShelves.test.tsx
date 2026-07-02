import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchShelves: vi.fn() }));
vi.mock('./discoverApi', () => api);

import { useShelves } from './useShelves';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useShelves', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns shelves from the api', async () => {
    api.fetchShelves.mockResolvedValue([{ slug: 'lang', title: 'Languages', sortOrder: 1 }]);
    const { result } = renderHook(() => useShelves(), { wrapper });
    await waitFor(() => expect(result.current.data?.[0].slug).toBe('lang'));
  });
});
