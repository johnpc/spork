import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flushPending } from './statApi';
import { loadPending } from './pendingSessions';
import { useAuth } from '../auth/useAuth';

/**
 * At launch (once the session is known), replay any study sessions whose
 * streak save was cut off by a reload or app close last time, then refresh the
 * stat. A failed replay stays queued for the next launch.
 */
export function usePendingStatReplay(): void {
  const { status, email } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (status !== 'authenticated' || !email || !loadPending(email).length) return;
    void flushPending(email)
      .then(() => queryClient.invalidateQueries({ queryKey: ['user-stat'] }))
      .catch(() => {});
  }, [status, email, queryClient]);
}

/** Mount point for usePendingStatReplay inside the auth + query providers. */
export function PendingStatReplay(): null {
  usePendingStatReplay();
  return null;
}
