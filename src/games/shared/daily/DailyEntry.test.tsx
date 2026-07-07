import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DailyEntry } from './DailyEntry';
import * as entry from './useDailyEntry';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Switch>
        <Route exact path="/daily/:game">
          <DailyEntry />
        </Route>
        <Route exact path="/daily/:game/:date">
          <DailyEntry />
        </Route>
        <Route path="/quizzes/:id/play">
          <div data-testid="play-surface">play</div>
        </Route>
        <Route path="/home">
          <div data-testid="home">home</div>
        </Route>
      </Switch>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

const GAME = {
  name: 'Quizzes',
  fetchList: vi.fn(),
  playPath: (id: string) => `/quizzes/${id}/play`,
  dailyKey: 'quizzes:MAP',
};
// The three browse-mode fields default off; individual tests override as needed.
const base = { browsing: false, generating: false, genError: false } as const;
const mockEntry = (v: Partial<ReturnType<typeof entry.useDailyEntry>>) =>
  vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
    date: '2026-07-03',
    game: GAME,
    playedToday: false,
    result: null,
    isLoading: false,
    playPath: null,
    empty: false,
    ...base,
    ...v,
  } as ReturnType<typeof entry.useDailyEntry>);

describe('DailyEntry', () => {
  it('shows the recap when today is already played', () => {
    mockEntry({ playedToday: true, result: { score: 4, total: 6, timeSeconds: 30 } });
    renderAt('/daily/quizzes');
    expect(screen.getByTestId('come-back-score')).toHaveTextContent('4 / 6 · 30s');
    // Per-route document title for browser history + screen-reader announcement.
    expect(document.title).toBe('Quizzes · Spork');
  });

  it('redirects into the play surface when a puzzle resolves', () => {
    mockEntry({ playPath: '/quizzes/abc/play' });
    renderAt('/daily/quizzes');
    expect(screen.getByTestId('play-surface')).toBeInTheDocument();
  });

  it('redirects home for an unknown game', () => {
    mockEntry({ game: undefined as unknown as ReturnType<typeof entry.useDailyEntry>['game'] });
    renderAt('/daily/nope');
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('shows a graceful empty state (not an infinite spinner) when no puzzle exists', () => {
    mockEntry({ empty: true });
    renderAt('/daily/worldle');
    expect(screen.getByTestId('daily-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('daily-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('daily-empty-home')).toHaveAttribute('href', '/home');
  });

  it('shows the loading state only while genuinely loading', () => {
    mockEntry({ isLoading: true });
    renderAt('/daily/worldle');
    expect(screen.getByTestId('daily-loading')).toBeInTheDocument();
  });

  it('shows the generating state while backfilling a browsed past day', () => {
    mockEntry({ browsing: true, generating: true });
    renderAt('/daily/worldle/2026-06-20');
    expect(screen.getByTestId('daily-generating')).toBeInTheDocument();
  });
});
