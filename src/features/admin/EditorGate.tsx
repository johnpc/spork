import { Redirect } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { useIsEditor } from './useIsEditor';

/**
 * Restricts a route to members of the 'editors' group. Signed-out users go to
 * sign-in; signed-in non-editors go to Discover. Wraps the admin screens.
 */
export function EditorGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const { isEditor, isLoading } = useIsEditor();

  if (status === 'loading' || (status === 'authenticated' && isLoading)) return null;
  if (status !== 'authenticated') return <Redirect to="/signin" />;
  if (!isEditor) return <Redirect to="/discover" />;
  return <>{children}</>;
}
