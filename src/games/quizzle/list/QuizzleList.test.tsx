import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { QuizzleRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({
  state: {} as { quizzles: QuizzleRecord[]; isLoading: boolean },
}));
vi.mock('./useQuizzleList', () => ({ useQuizzleList: () => hook.state }));

import { QuizzleList } from './QuizzleList';

const renderList = () =>
  render(
    <MemoryRouter>
      <QuizzleList />
    </MemoryRouter>,
  );

describe('QuizzleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists quizzles with a link into play', () => {
    hook.state = {
      isLoading: false,
      quizzles: [{ id: 'q1', topic: 'Capitals', startingBank: 1000 } as QuizzleRecord],
    };
    renderList();
    const link = screen.getByTestId('quizzle-link');
    expect(link).toHaveAttribute('href', '/quizzle/q1');
    expect(link).toHaveTextContent('Capitals');
  });

  it('shows an empty message when there are none', () => {
    hook.state = { isLoading: false, quizzles: [] };
    renderList();
    expect(screen.getByTestId('quizzles-empty')).toBeInTheDocument();
  });
});
