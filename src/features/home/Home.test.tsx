import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Home } from './Home';
import { ALL_GAMES } from '../../games/gameCatalog';
import { dayStamp } from '../../games/shared/daily/today';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

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

  it('shows a fresh-day progress tally with nothing done', () => {
    renderHome();
    // 9 quiz types + 4 daily islands (Flashcards is non-daily) = 13 daily games.
    expect(screen.getByTestId('home-progress')).toHaveTextContent('Today: 0/13 done');
  });

  it('badges a finished game and counts it in the tally', () => {
    const key = `spork.daily.quizzes:MAP.${dayStamp(new Date())}`;
    window.localStorage.setItem(key, JSON.stringify({ score: 4, total: 6 }));
    renderHome();
    expect(screen.getByTestId('game-worldle-done')).toHaveTextContent('✅ 4/6');
    expect(screen.getByTestId('home-progress')).toHaveTextContent('Today: 1/13 done');
    // A game not yet played shows no badge.
    expect(screen.queryByTestId('game-steps-done')).not.toBeInTheDocument();
  });
});
