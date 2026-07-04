import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AcrosticReveal } from './AcrosticReveal';

const baseProps = {
  clues: [
    { clue: 'A feline', answer: 'cat' },
    { clue: 'Frozen water', answer: 'ice' },
    { clue: 'A color', answer: 'red' },
  ],
  solved: new Set([0]),
  secret: 'CIR',
  quote: 'Do or do not',
  author: 'Yoda',
  complete: false,
};

describe('AcrosticReveal', () => {
  it('shows the secret word and quote', () => {
    render(<AcrosticReveal {...baseProps} />);
    expect(screen.getByTestId('acrostic-reveal')).toHaveTextContent('CIR');
    expect(screen.getByTestId('reveal-quote')).toHaveTextContent('Do or do not');
    expect(screen.getByTestId('reveal-author')).toHaveTextContent('Yoda');
  });

  it('shows all clue answers in uppercase', () => {
    render(<AcrosticReveal {...baseProps} />);
    expect(screen.getByText('CAT')).toBeInTheDocument();
    expect(screen.getByText('ICE')).toBeInTheDocument();
    expect(screen.getByText('RED')).toBeInTheDocument();
  });

  it('marks already-solved clues distinctly from revealed ones', () => {
    render(<AcrosticReveal {...baseProps} />);
    const solved = screen.getAllByTestId('reveal-solved');
    const unsolved = screen.getAllByTestId('reveal-unsolved');
    expect(solved).toHaveLength(1);
    expect(unsolved).toHaveLength(2);
  });

  it('shows solved banner when complete', () => {
    render(<AcrosticReveal {...baseProps} complete />);
    expect(screen.getByText(/Solved! 🏆/)).toBeInTheDocument();
  });

  it('shows give-up text when not complete', () => {
    render(<AcrosticReveal {...baseProps} complete={false} />);
    expect(screen.getByText(/The word was/)).toBeInTheDocument();
    expect(screen.queryByText(/Solved!/)).not.toBeInTheDocument();
  });

  it('has role=status for accessibility', () => {
    render(<AcrosticReveal {...baseProps} />);
    expect(screen.getByTestId('acrostic-reveal')).toHaveAttribute('role', 'status');
  });
});
