import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const play = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./usePlay', () => ({ usePlay: () => play.state }));
vi.mock('./useBestScore', () => ({
  useBestScore: () => ({ best: null, refresh: vi.fn() }),
}));
vi.mock('react-simple-maps', () => ({
  ComposableMap: () => null,
  Geographies: () => null,
  Geography: () => null,
}));
vi.mock('world-atlas/countries-110m.json', () => ({ default: {} }));

import { Play } from './Play';

const renderPlay = () =>
  render(
    <MemoryRouter initialEntries={['/quizzes/q1/play']}>
      <Play />
    </MemoryRouter>,
  );

describe('Play', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading while fetching', () => {
    play.state = { isLoading: true, score: { found: 0, total: 0 }, found: new Set() };
    renderPlay();
    expect(screen.getByTestId('load-loading')).toBeInTheDocument();
  });

  it('shows an unavailable message for an unbuilt mode', () => {
    play.state = {
      isLoading: false,
      quiz: { mode: 'ORDERED', topic: 'X' },
      effectiveMode: 'ORDERED',
      answers: [],
      found: new Set(),
      score: { found: 0, total: 0 },
      status: 'idle',
    };
    renderPlay();
    expect(screen.getByTestId('play-unavailable')).toBeInTheDocument();
  });

  it('renders the start button for a playable MAP quiz in idle', () => {
    play.state = {
      isLoading: false,
      quiz: { mode: 'MAP', topic: 'Countries' },
      effectiveMode: 'MAP',
      answers: [],
      found: new Set(),
      status: 'idle',
      remaining: 300,
      score: { found: 0, total: 195 },
      start: vi.fn(),
    };
    renderPlay();
    expect(screen.getByTestId('play-start')).toBeInTheDocument();
    expect(screen.getByTestId('play-hud')).toBeInTheDocument();
    // First-timer onboarding: a mode-specific how-to-play hint before the timer.
    expect(screen.getByTestId('play-hint')).toHaveTextContent('map');
  });

  it('shows the input while running and the summary when done', () => {
    const base = {
      isLoading: false,
      quiz: { mode: 'MAP', topic: 'Countries' },
      effectiveMode: 'MAP',
      answers: [],
      found: new Set(),
      remaining: 120,
      submit: vi.fn(),
      start: vi.fn(),
      giveUp: vi.fn(),
    };
    play.state = { ...base, status: 'running', score: { found: 1, total: 195 } };
    const { rerender } = renderPlay();
    expect(screen.getByTestId('play-input')).toBeInTheDocument();

    play.state = { ...base, status: 'done', score: { found: 3, total: 195 } };
    rerender(
      <MemoryRouter initialEntries={['/quizzes/q1/play']}>
        <Play />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('play-done')).toBeInTheDocument();
    // The how-to-play hint is gone once the session is over.
    expect(screen.queryByTestId('play-hint')).not.toBeInTheDocument();
  });
});
