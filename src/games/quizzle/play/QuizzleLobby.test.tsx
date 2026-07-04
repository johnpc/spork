import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuizzleLobby } from './QuizzleLobby';

describe('QuizzleLobby', () => {
  it('shows the rules and starting bank', () => {
    const onStart = vi.fn();
    render(<QuizzleLobby total={8} startingBank={1000} best={null} onStart={onStart} />);
    expect(screen.getByText(/each of 8 questions/)).toBeInTheDocument();
    expect(screen.getByTestId('quizzle-start')).toHaveTextContent('Start · bank 1000');
  });

  it('shows the best bank when available', () => {
    const onStart = vi.fn();
    render(<QuizzleLobby total={8} startingBank={1000} best={1500} onStart={onStart} />);
    expect(screen.getByTestId('quizzle-best')).toHaveTextContent('Your best bank: 1500');
  });

  it('hides the best bank when null', () => {
    const onStart = vi.fn();
    render(<QuizzleLobby total={8} startingBank={1000} best={null} onStart={onStart} />);
    expect(screen.queryByTestId('quizzle-best')).not.toBeInTheDocument();
  });
});
