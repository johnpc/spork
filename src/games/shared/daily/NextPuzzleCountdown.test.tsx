import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NextPuzzleCountdown } from './NextPuzzleCountdown';

describe('NextPuzzleCountdown', () => {
  it('renders a "next puzzle in Hh MMm" line', () => {
    render(<NextPuzzleCountdown />);
    const el = screen.getByTestId('next-puzzle-countdown');
    expect(el).toHaveTextContent(/Next puzzle in \d+h \d{2}m/);
  });
});
