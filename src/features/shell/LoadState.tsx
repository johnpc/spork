import { type ReactNode } from 'react';
import { alertCircleOutline, fileTrayOutline } from 'ionicons/icons';
import { EmptyState } from './EmptyState';

interface LoadStateProps {
  isLoading: boolean;
  isError?: boolean;
  /** True when loading finished but there's nothing to show. */
  isEmpty?: boolean;
  /** Copy for the empty state (error copy is standard). */
  emptyTitle?: string;
  emptyMessage?: string;
  /** Retry the failed fetch (react-query refetch). */
  onRetry?: () => void;
  children: ReactNode;
}

/** Uniform loading / error / empty gate for a data screen. Renders a spinner
 * while loading, a retryable error state on failure, an empty state when there's
 * nothing, and otherwise the children. Stops screens from hanging on a spinner
 * or silently blanking when a fetch fails. */
export function LoadState({
  isLoading,
  isError,
  isEmpty,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  onRetry,
  children,
}: LoadStateProps) {
  if (isLoading) {
    return (
      <p className="sp-muted" data-testid="load-loading">
        Loading…
      </p>
    );
  }
  if (isError) {
    return (
      <EmptyState
        icon={alertCircleOutline}
        title="Something went wrong"
        message="We couldn’t load this. Check your connection and try again."
        testId="load-error"
      >
        {onRetry && (
          <button
            type="button"
            className="empty-state__cta"
            data-testid="load-retry"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </EmptyState>
    );
  }
  if (isEmpty) {
    return (
      <EmptyState
        icon={fileTrayOutline}
        title={emptyTitle}
        message={emptyMessage}
        testId="load-empty"
      />
    );
  }
  return <>{children}</>;
}
