import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuizzleDone } from './QuizzleDone';

describe('QuizzleDone', () => {
  it('shows a winning verdict and the best bank', () => {
    render(<QuizzleDone bank={1500} startingBank={1000} best={1500} />);
    expect(screen.getByTestId('quizzle-final-bank')).toHaveTextContent('1500');
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('ahead');
    expect(screen.getByTestId('quizzle-best')).toHaveTextContent('1500');
  });

  it('shows a losing verdict', () => {
    render(<QuizzleDone bank={400} startingBank={1000} best={null} />);
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('house won');
  });

  it('shows a break-even verdict', () => {
    render(<QuizzleDone bank={1000} startingBank={1000} best={null} />);
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('broke even');
  });
});
