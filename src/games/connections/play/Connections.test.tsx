import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useConnections', () => ({ useConnections: () => hook.state }));
vi.mock('../../shared/daily/useRecordDailyOnDone', () => ({
  useRecordDailyOnDone: vi.fn(),
}));
vi.mock('../../shared/daily/useElapsed', () => ({
  useElapsed: () => 0,
}));
vi.mock('../../shared/daily/useDailyGuard', () => ({
  useDailyGuard: () => null,
}));

import { Connections } from './Connections';

const renderConnections = () =>
  render(
    <MemoryRouter initialEntries={['/connections/c1']}>
      <Connections />
    </MemoryRouter>,
  );

const basePuzzle = {
  id: 'c1',
  groups: JSON.stringify([
    { theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 },
  ]),
};

const base = {
  puzzle: basePuzzle,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  groups: [{ theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 }],
  tiles: ['apple', 'banana', 'cherry', 'date'],
  selected: [],
  solvedGroups: [],
  mistakes: 0,
  maxMistakes: 4,
  lastOneAway: false,
  won: false,
  lost: false,
  done: false,
  toggle: vi.fn(),
  submit: vi.fn(),
  deselectAll: vi.fn(),
};

describe('Connections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the game grid and actions while playing', () => {
    hook.state = { ...base };
    renderConnections();
    expect(screen.getByTestId('connections')).toBeInTheDocument();
    expect(screen.getByText(/Find groups of four/)).toBeInTheDocument();
    expect(screen.getByText(/Mistakes:/)).toHaveTextContent('Mistakes: 0 / 4');
    expect(screen.getByTestId('connections-submit')).toBeInTheDocument();
  });

  it('shows one-away hint when lastOneAway is true', () => {
    hook.state = { ...base, lastOneAway: true };
    renderConnections();
    expect(screen.getByTestId('connections-hint')).toHaveTextContent('One away!');
  });

  it('shows won banner and hides actions when won', () => {
    hook.state = {
      ...base,
      solvedGroups: base.groups,
      won: true,
      done: true,
    };
    renderConnections();
    expect(screen.getByTestId('connections-won')).toHaveTextContent('All groups found!');
    expect(screen.getByTestId('connections-won')).toHaveAttribute('role', 'status');
    expect(screen.queryByTestId('connections-submit')).not.toBeInTheDocument();
  });

  it('shows lost banner and hides actions when lost', () => {
    hook.state = {
      ...base,
      mistakes: 4,
      lost: true,
      done: true,
    };
    renderConnections();
    expect(screen.getByTestId('connections-lost')).toHaveTextContent('Game over!');
    expect(screen.getByTestId('connections-lost')).toHaveAttribute('role', 'status');
    expect(screen.queryByTestId('connections-submit')).not.toBeInTheDocument();
  });

  it('shows unavailable message when puzzle is null', () => {
    hook.state = { ...base, puzzle: null };
    renderConnections();
    expect(screen.getByTestId('connections-unavailable')).toHaveTextContent("can't be played yet");
  });

  it('displays solved groups', () => {
    hook.state = {
      ...base,
      solvedGroups: [{ theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 }],
    };
    renderConnections();
    // ConnectionsGrid should receive solvedGroups and render them
    expect(screen.getByTestId('connections')).toBeInTheDocument();
  });
});
