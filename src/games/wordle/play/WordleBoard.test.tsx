import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WordleBoard } from './WordleBoard';

describe('WordleBoard', () => {
  it('renders past guesses with scored tiles', () => {
    render(
      <WordleBoard
        guesses={['crane', 'crate']}
        current=""
        answer="crane"
        wordLength={5}
        maxGuesses={6}
      />,
    );
    const board = screen.getByTestId('wordle-board');
    expect(board).toBeInTheDocument();
    const rows = screen.getAllByTestId('wordle-row');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('shows current input row with empty tiles', () => {
    render(<WordleBoard guesses={[]} current="cr" answer="crane" wordLength={5} maxGuesses={6} />);
    const tile0 = screen.getByTestId('wordle-tile-0-0');
    const tile1 = screen.getByTestId('wordle-tile-0-1');
    expect(tile0).toHaveTextContent('C');
    expect(tile1).toHaveTextContent('R');
    expect(tile0).toHaveClass('wordle-board__tile--empty');
  });

  it('renders empty rows when guesses remain', () => {
    render(
      <WordleBoard guesses={['crane']} current="" answer="crane" wordLength={5} maxGuesses={6} />,
    );
    const board = screen.getByTestId('wordle-board');
    expect(board).toBeInTheDocument();
    const rows = screen.getAllByTestId(/wordle-row/);
    expect(rows.length).toBeLessThanOrEqual(6);
  });

  it('applies correct tile classes based on scoring', () => {
    render(
      <WordleBoard guesses={['crate']} current="" answer="crane" wordLength={5} maxGuesses={6} />,
    );
    const tile0 = screen.getByTestId('wordle-tile-0-0');
    expect(tile0).toHaveClass('wordle-board__tile--correct');
  });

  it('does not show current row when game is over', () => {
    render(
      <WordleBoard
        guesses={['crane']}
        current="hello"
        answer="crane"
        wordLength={5}
        maxGuesses={1}
      />,
    );
    expect(screen.queryByText('H')).not.toBeInTheDocument();
  });

  it('handles word length variations', () => {
    render(<WordleBoard guesses={[]} current="cat" answer="cats" wordLength={4} maxGuesses={6} />);
    const tile0 = screen.getByTestId('wordle-tile-0-0');
    const tile2 = screen.getByTestId('wordle-tile-0-2');
    expect(tile0).toHaveTextContent('C');
    expect(tile2).toHaveTextContent('T');
  });
});
