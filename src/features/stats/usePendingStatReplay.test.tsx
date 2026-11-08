import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const api = vi.hoisted(() => ({ flushPending: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string, email: 'me@x.com' }));
vi.mock('./statApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => auth }));

import { PendingStatReplay } from './usePendingStatReplay';
import { addPending } from './pendingSessions';

const client = new QueryClient();
const mount = () =>
  render(
    <QueryClientProvider client={client}>
      <PendingStatReplay />
    </QueryClientProvider>,
  );

describe('PendingStatReplay (launch replay)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    auth.status = 'authenticated';
    api.flushPending.mockResolvedValue(undefined);
  });

  it('replays queued sessions once signed in and refreshes the stat', async () => {
    addPending({ sessionId: 'p1', owner: 'me@x.com', day: '2026-06-10', reviewed: 3 });
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    mount();
    await waitFor(() => expect(api.flushPending).toHaveBeenCalledWith('me@x.com'));
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['user-stat'] }));
  });

  it('does nothing when the outbox is empty or the user is signed out', () => {
    mount();
    auth.status = 'unauthenticated';
    addPending({ sessionId: 'p1', owner: 'me@x.com', day: '2026-06-10', reviewed: 3 });
    mount();
    expect(api.flushPending).not.toHaveBeenCalled();
  });

  it('swallows a failed replay (it stays queued for next launch)', async () => {
    addPending({ sessionId: 'p1', owner: 'me@x.com', day: '2026-06-10', reviewed: 3 });
    api.flushPending.mockRejectedValue(new Error('offline'));
    mount();
    await waitFor(() => expect(api.flushPending).toHaveBeenCalled());
  });
});
