import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('shows the game shelf with links into each game', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-games')).toBeInTheDocument();
    // Each daily game routes through /daily/:game, which resolves today's puzzle.
    expect(screen.getByTestId('game-quizzes')).toHaveAttribute('href', '/daily/quizzes');
    expect(screen.getByTestId('game-steps')).toHaveAttribute('href', '/daily/steps');
    expect(screen.getByTestId('game-acrostic')).toHaveAttribute('href', '/daily/acrostic');
    expect(screen.getByTestId('game-quizzle')).toHaveAttribute('href', '/daily/quizzle');
    expect(screen.getByTestId('game-chess')).toHaveAttribute('href', '/daily/chess');
    expect(screen.getByTestId('game-flashcards')).toHaveAttribute('href', '/discover');
  });
});
