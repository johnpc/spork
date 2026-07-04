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
  it('sets the browser document title to the brand', () => {
    renderHome();
    expect(document.title).toBe('Spork');
  });

  it('shows a card per daily game — each quiz type as its own game', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-games')).toBeInTheDocument();
    // One card per catalog entry (12 quiz types + 8 islands = 20).
    expect(ALL_GAMES.length).toBe(20);
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
    // 12 quiz types + 7 daily islands (Flashcards is non-daily) = 19 daily games.
    expect(screen.getByTestId('home-progress')).toHaveTextContent('Today: 0/19 done');
  });

  it('badges a finished game and counts it in the tally', () => {
    const key = `spork.daily.quizzes:MAP.${dayStamp(new Date())}`;
    window.localStorage.setItem(key, JSON.stringify({ score: 4, total: 6 }));
    renderHome();
    expect(screen.getByTestId('game-worldle-done')).toHaveTextContent('✅ 4/6');
    expect(screen.getByTestId('home-progress')).toHaveTextContent('Today: 1/19 done');
    // A game not yet played shows no badge.
    expect(screen.queryByTestId('game-steps-done')).not.toBeInTheDocument();
  });

  it('shows the daily streak once at least one puzzle is done', () => {
    const stamp = (offsetDays: number) => dayStamp(new Date(Date.now() - offsetDays * 86_400_000));
    window.localStorage.setItem(
      `spork.daily.quizzes:MAP.${stamp(1)}`,
      JSON.stringify({ score: 1, total: 1 }),
    );
    window.localStorage.setItem(
      `spork.daily.steps.${stamp(0)}`,
      JSON.stringify({ score: 1, total: 1 }),
    );
    renderHome();
    expect(screen.getByTestId('home-streak')).toHaveTextContent('🔥 2-day streak');
  });

  it('hides the streak when nothing has been played', () => {
    renderHome();
    expect(screen.queryByTestId('home-streak')).not.toBeInTheDocument();
  });

  it('offers "Share my day" once a game is finished, and hides it otherwise', () => {
    renderHome();
    expect(screen.queryByTestId('share-day')).not.toBeInTheDocument();
    window.localStorage.setItem(
      `spork.daily.quizzes:MAP.${dayStamp(new Date())}`,
      JSON.stringify({ score: 4, total: 6 }),
    );
    // Re-render with a finished game present.
    renderHome();
    expect(screen.getAllByTestId('share-day').length).toBeGreaterThan(0);
  });
});
