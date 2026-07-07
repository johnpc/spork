import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomeCard } from './HomeCard';
import type { GameCard } from './homeGames';

const game: GameCard = {
  name: 'Worldle',
  tagline: 'Name every country.',
  to: '/daily/worldle',
  testId: 'game-worldle',
  emoji: '🗺️',
  accent: 'blue',
  dailyKey: 'quizzes:MAP',
};

function renderCard(result: Parameters<typeof HomeCard>[0]['result'], date?: string) {
  return render(
    <MemoryRouter>
      <HomeCard game={game} result={result} date={date} />
    </MemoryRouter>,
  );
}

describe('HomeCard', () => {
  it('shows a score badge and done class when finished', () => {
    renderCard({ score: 5, total: 8 });
    expect(screen.getByTestId('game-worldle-done')).toHaveTextContent('✅ 5/8');
    expect(screen.getByTestId('game-worldle')).toHaveClass('home-card--done');
  });

  it('renders no badge when not yet played', () => {
    renderCard(null);
    expect(screen.queryByTestId('game-worldle-done')).not.toBeInTheDocument();
    expect(screen.getByTestId('game-worldle')).not.toHaveClass('home-card--done');
  });

  it('links to today’s bare route when no date is given', () => {
    renderCard(null);
    expect(screen.getByTestId('game-worldle')).toHaveAttribute('href', '/daily/worldle');
  });

  it('links to the dated route when browsing a past day', () => {
    renderCard({ score: 2, total: 8 }, '2026-06-20');
    expect(screen.getByTestId('game-worldle')).toHaveAttribute('href', '/daily/worldle/2026-06-20');
  });
});
