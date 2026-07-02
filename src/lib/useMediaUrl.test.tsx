import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const getUrl = vi.hoisted(() => vi.fn());
vi.mock('aws-amplify/storage', () => ({ getUrl }));

import { useMediaUrl } from './useMediaUrl';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMediaUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves an S3 key to a URL string', async () => {
    getUrl.mockResolvedValue({ url: new URL('https://s3/media/decks/x.png') });
    const { result } = renderHook(() => useMediaUrl('media/decks/x.png'), { wrapper });
    await waitFor(() => expect(result.current).toBe('https://s3/media/decks/x.png'));
  });

  it('returns null and does not fetch when given no path', () => {
    const { result } = renderHook(() => useMediaUrl(null), { wrapper });
    expect(result.current).toBeNull();
    expect(getUrl).not.toHaveBeenCalled();
  });
});
