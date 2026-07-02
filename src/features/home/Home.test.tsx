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
    expect(screen.getByTestId('game-quizzes')).toHaveAttribute('href', '/quizzes');
    expect(screen.getByTestId('game-flashcards')).toHaveAttribute('href', '/discover');
  });
});
