import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WordleResult } from './WordleResult';

describe('WordleResult', () => {
  it('renders nothing while playing', () => {
    const { container } = render(<WordleResult status="playing" guessCount={2} answer="crane" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the guess count on a win', () => {
    render(<WordleResult status="won" guessCount={3} answer="crane" />);
    expect(screen.getByTestId('wordle-won')).toHaveTextContent('You won in 3 guesses!');
  });

  it('reveals the answer on a loss', () => {
    render(<WordleResult status="lost" guessCount={6} answer="crane" />);
    expect(screen.getByTestId('wordle-lost')).toHaveTextContent('CRANE');
  });
});
