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
});
