import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ recordSession: vi.fn() }));
vi.mock('../stats/statApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ email: 'me@x.com' }) }));

import { useRecordOnDone } from './useRecordOnDone';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useRecordOnDone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.recordSession.mockResolvedValue(undefined);
  });

  it('does not record while the session is in progress', () => {
    renderHook(() => useRecordOnDone(false, 5), { wrapper });
    expect(api.recordSession).not.toHaveBeenCalled();
  });

  it('records once when done flips true', async () => {
    const { rerender } = renderHook(({ done }) => useRecordOnDone(done, 5), {
      wrapper,
      initialProps: { done: false },
    });
    rerender({ done: true });
    await waitFor(() => expect(api.recordSession).toHaveBeenCalledWith('me@x.com', 5));
    rerender({ done: true }); // re-render while still done → no second record
    expect(api.recordSession).toHaveBeenCalledTimes(1);
  });

  it('a failed save does not throw (the session stays queued for replay)', async () => {
    api.recordSession.mockRejectedValue(new Error('offline'));
    renderHook(() => useRecordOnDone(true, 2), { wrapper });
    await waitFor(() => expect(api.recordSession).toHaveBeenCalledWith('me@x.com', 2));
  });

  it('re-arms after the session resets (done → false → true again)', async () => {
    const { rerender } = renderHook(({ done }) => useRecordOnDone(done, 3), {
      wrapper,
      initialProps: { done: true },
    });
    await waitFor(() => expect(api.recordSession).toHaveBeenCalledTimes(1));
    rerender({ done: false });
    rerender({ done: true });
    await waitFor(() => expect(api.recordSession).toHaveBeenCalledTimes(2));
  });
});
