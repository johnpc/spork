import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Home } from './Home';
import { ALL_GAMES } from '../../games/gameCatalog';

describe('Home', () => {
  it('shows a card per daily game — each quiz type as its own game', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-games')).toBeInTheDocument();
    // One card per catalog entry (9 quiz types + 5 islands = 14).
    expect(ALL_GAMES.length).toBe(14);
    // Quiz types route to their /daily/<slug>; each is its own daily game.
    expect(screen.getByTestId('game-worldle')).toHaveAttribute('href', '/daily/worldle');
    expect(screen.getByTestId('game-in-order')).toHaveAttribute('href', '/daily/in-order');
    expect(screen.getByTestId('game-picture-this')).toHaveAttribute('href', '/daily/picture-this');
    // Standalone islands + Flashcards (which browses Discover).
    expect(screen.getByTestId('game-steps')).toHaveAttribute('href', '/daily/steps');
    expect(screen.getByTestId('game-chess')).toHaveAttribute('href', '/daily/chess');
    expect(screen.getByTestId('game-flashcards')).toHaveAttribute('href', '/discover');
  });
});
