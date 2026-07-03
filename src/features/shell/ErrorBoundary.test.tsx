import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p data-testid="ok">all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
  });

  it('shows the fallback and can trigger a reload when a child throws', () => {
    // Silence the expected React error log for the thrown render.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReload = vi.fn();
    render(
      <ErrorBoundary onReload={onReload}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-home')).toHaveAttribute('href', '/home');
    fireEvent.click(screen.getByTestId('error-reload'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
