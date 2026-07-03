import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayHud } from './PlayHud';

describe('PlayHud', () => {
  it('shows the clock, score, and percent', () => {
    render(<PlayHud remaining={125} found={1} total={4} />);
    expect(screen.getByTestId('play-clock')).toHaveTextContent('2:05');
    expect(screen.getByTestId('play-score')).toHaveTextContent('1 / 4');
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('exposes the score as a polite live region for screen readers', () => {
    render(<PlayHud remaining={125} found={3} total={174} />);
    const score = screen.getByTestId('play-score');
    expect(score).toHaveAttribute('aria-live', 'polite');
    expect(score).toHaveAttribute('aria-label', '3 of 174 found');
    // The clock must NOT be live (it would announce every tick).
    expect(screen.getByTestId('play-clock')).not.toHaveAttribute('aria-live');
  });
});
