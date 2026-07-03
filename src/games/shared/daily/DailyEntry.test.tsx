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

describe('DailyEntry', () => {
  it('shows the recap when today is already played', () => {
    vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
      date: '2026-07-03',
      game: {
        name: 'Quizzes',
        fetchList: vi.fn(),
        playPath: (id) => `/quizzes/${id}/play`,
        dailyKey: 'quizzes:MAP',
      },
      playedToday: true,
      result: { score: 4, total: 6, timeSeconds: 30 },
      isLoading: false,
      playPath: null,
      empty: false,
    });
    renderAt('/daily/quizzes');
    expect(screen.getByTestId('come-back-score')).toHaveTextContent('4 / 6 · 30s');
    // Per-route document title for browser history + screen-reader announcement.
    expect(document.title).toBe('Quizzes · Spork');
  });

  it('redirects into the play surface when a puzzle resolves', () => {
    vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
      date: '2026-07-03',
      game: {
        name: 'Quizzes',
        fetchList: vi.fn(),
        playPath: (id) => `/quizzes/${id}/play`,
        dailyKey: 'quizzes:MAP',
      },
      playedToday: false,
      result: null,
      isLoading: false,
      playPath: '/quizzes/abc/play',
      empty: false,
    });
    renderAt('/daily/quizzes');
    expect(screen.getByTestId('play-surface')).toBeInTheDocument();
  });

  it('redirects home for an unknown game', () => {
    vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
      date: '2026-07-03',
      game: undefined as unknown as ReturnType<typeof entry.useDailyEntry>['game'],
      playedToday: false,
      result: null,
      isLoading: false,
      playPath: null,
      empty: false,
    });
    renderAt('/daily/nope');
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('shows a graceful empty state (not an infinite spinner) when no puzzle exists', () => {
    vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
      date: '2026-07-03',
      game: {
        name: 'Worldle',
        fetchList: vi.fn(),
        playPath: (id) => `/quizzes/${id}/play`,
        dailyKey: 'quizzes:MAP',
      },
      playedToday: false,
      result: null,
      isLoading: false,
      playPath: null,
      empty: true,
    });
    renderAt('/daily/worldle');
    expect(screen.getByTestId('daily-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('daily-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('daily-empty-home')).toHaveAttribute('href', '/home');
  });

  it('shows the loading state only while genuinely loading', () => {
    vi.spyOn(entry, 'useDailyEntry').mockReturnValue({
      date: '2026-07-03',
      game: {
        name: 'Worldle',
        fetchList: vi.fn(),
        playPath: (id) => `/quizzes/${id}/play`,
        dailyKey: 'quizzes:MAP',
      },
      playedToday: false,
      result: null,
      isLoading: true,
      playPath: null,
      empty: false,
    });
    renderAt('/daily/worldle');
    expect(screen.getByTestId('daily-loading')).toBeInTheDocument();
  });
});
