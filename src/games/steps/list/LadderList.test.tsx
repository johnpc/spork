import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WordLadderRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({
  state: {} as { ladders: WordLadderRecord[]; isLoading: boolean },
}));
vi.mock('./useLadders', () => ({ useLadders: () => hook.state }));

import { LadderList } from './LadderList';

const renderList = () =>
  render(
    <MemoryRouter>
      <LadderList />
    </MemoryRouter>,
  );

describe('LadderList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists ladders with a link into play', () => {
    hook.state = {
      isLoading: false,
      ladders: [{ id: 'l1', start: 'cat', target: 'dog', difficulty: 'EASY' } as WordLadderRecord],
    };
    renderList();
    const link = screen.getByTestId('ladder-link');
    expect(link).toHaveAttribute('href', '/steps/l1');
    expect(link).toHaveTextContent('CAT → DOG');
  });

  it('shows an empty message when there are none', () => {
    hook.state = { isLoading: false, ladders: [] };
    renderList();
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });
});
