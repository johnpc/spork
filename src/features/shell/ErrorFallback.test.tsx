import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('renders the message and calls onReload when the button is clicked', () => {
    const onReload = vi.fn();
    render(<ErrorFallback onReload={onReload} />);
    expect(screen.getByTestId('error-fallback')).toHaveTextContent('Something went sideways');
    expect(screen.getByTestId('error-home')).toHaveAttribute('href', '/home');
    fireEvent.click(screen.getByTestId('error-reload'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
