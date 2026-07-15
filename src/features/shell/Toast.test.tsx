import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';
import { showToast } from './toastBus';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing until a message is shown', () => {
    render(<Toast />);
    expect(screen.queryByTestId('app-toast')).not.toBeInTheDocument();
  });

  it('shows a message and auto-dismisses after 6s', () => {
    render(<Toast />);
    act(() => showToast('Saved'));
    expect(screen.getByTestId('app-toast')).toHaveTextContent('Saved');
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByTestId('app-toast')).not.toBeInTheDocument();
  });

  it('runs the action then dismisses', () => {
    const run = vi.fn();
    render(<Toast />);
    act(() => showToast('Failed', { label: 'Retry', run }));
    act(() => fireEvent.click(screen.getByTestId('app-toast-action')));
    expect(run).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('app-toast')).not.toBeInTheDocument();
  });

  it('dismisses on the close button', () => {
    render(<Toast />);
    act(() => showToast('Note'));
    act(() => fireEvent.click(screen.getByRole('button', { name: 'Dismiss' })));
    expect(screen.queryByTestId('app-toast')).not.toBeInTheDocument();
  });
});
