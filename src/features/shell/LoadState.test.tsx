import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadState } from './LoadState';

const child = <div data-testid="content">ready</div>;

describe('LoadState', () => {
  it('shows skeleton placeholders while loading (never the children)', () => {
    render(<LoadState isLoading>{child}</LoadState>);
    expect(screen.getByTestId('load-loading')).toBeInTheDocument();
    // Default placeholder is the card-row skeleton, not the real content.
    expect(screen.getByTestId('skeleton-rows')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders a bespoke skeleton override when provided', () => {
    render(
      <LoadState isLoading skeleton={<div data-testid="board-skeleton" />}>
        {child}
      </LoadState>,
    );
    expect(screen.getByTestId('board-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton-rows')).not.toBeInTheDocument();
  });

  it('shows a retryable error state on failure', () => {
    const onRetry = vi.fn();
    render(
      <LoadState isLoading={false} isError onRetry={onRetry}>
        {child}
      </LoadState>,
    );
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('load-retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('error takes priority over empty', () => {
    render(
      <LoadState isLoading={false} isError isEmpty>
        {child}
      </LoadState>,
    );
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    expect(screen.queryByTestId('load-empty')).not.toBeInTheDocument();
  });

  it('shows the empty state (with custom copy) when there is nothing', () => {
    render(
      <LoadState isLoading={false} isEmpty emptyTitle="No ladders yet">
        {child}
      </LoadState>,
    );
    expect(screen.getByTestId('load-empty')).toHaveTextContent('No ladders yet');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders the children when loaded, present, and error-free', () => {
    render(
      <LoadState isLoading={false} isError={false} isEmpty={false}>
        {child}
      </LoadState>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
