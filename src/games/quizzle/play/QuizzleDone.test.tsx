import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuizzleDone } from './QuizzleDone';

const questions = [
  { question: 'Capital of France?', answer: 'Paris' },
  { question: 'Largest country?', answer: 'Russia', accepted: ['Russian Federation'] },
];

describe('QuizzleDone', () => {
  it('shows a winning verdict and the best bank', () => {
    render(<QuizzleDone bank={1500} startingBank={1000} best={1500} questions={questions} />);
    expect(screen.getByTestId('quizzle-final-bank')).toHaveTextContent('1500');
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('ahead');
    expect(screen.getByTestId('quizzle-best')).toHaveTextContent('1500');
  });

  it('shows a losing verdict', () => {
    render(<QuizzleDone bank={400} startingBank={1000} best={null} questions={questions} />);
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('house won');
  });

  it('shows a break-even verdict', () => {
    render(<QuizzleDone bank={1000} startingBank={1000} best={null} questions={questions} />);
    expect(screen.getByTestId('quizzle-done')).toHaveTextContent('broke even');
  });

  it('shows a review of all questions with correct answers', () => {
    render(<QuizzleDone bank={1000} startingBank={1000} best={null} questions={questions} />);
    const review = screen.getByTestId('quizzle-review');
    expect(review).toHaveTextContent('Capital of France?');
    expect(review).toHaveTextContent('Answer: Paris');
    expect(review).toHaveTextContent('Largest country?');
    expect(review).toHaveTextContent('Answer: Russia');
  });

  it('shows no review when questions array is empty', () => {
    render(<QuizzleDone bank={1000} startingBank={1000} best={null} questions={[]} />);
    expect(screen.queryByTestId('quizzle-review')).not.toBeInTheDocument();
  });
});
