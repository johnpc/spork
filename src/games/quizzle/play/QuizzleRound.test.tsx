import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizzleRound } from './QuizzleRound';

const base = {
  question: { question: 'Capital of France?', answer: 'Paris' },
  bank: 1000,
  wagerAmount: 500,
  lastCorrect: null as boolean | null,
  lastAnswer: null as string | null,
  onWager: vi.fn(),
  onAnswer: vi.fn(),
  onAdvance: vi.fn(),
};

describe('QuizzleRound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the wager input in the wager stage', () => {
    render(<QuizzleRound {...base} stage="wager" />);
    expect(screen.getByTestId('quizzle-question')).toHaveTextContent('France');
    expect(screen.getByTestId('wager-input')).toBeInTheDocument();
  });

  it('shows the answer input once wagered', () => {
    render(<QuizzleRound {...base} stage="answer" />);
    expect(screen.getByTestId('quizzle-wager-amount')).toHaveTextContent('500');
    expect(screen.getByTestId('answer-input')).toBeInTheDocument();
  });

  it('shows a correct result and the next button', () => {
    render(<QuizzleRound {...base} stage="answer" lastCorrect={true} lastAnswer="Paris" />);
    expect(screen.getByTestId('quizzle-result')).toHaveTextContent('Correct! +500');
    expect(screen.getByTestId('quizzle-next')).toBeInTheDocument();
  });

  it('shows a wrong result with the answer revealed', () => {
    render(<QuizzleRound {...base} stage="answer" lastCorrect={false} lastAnswer="Paris" />);
    expect(screen.getByTestId('quizzle-result')).toHaveTextContent('Wrong — Paris');
  });
});
