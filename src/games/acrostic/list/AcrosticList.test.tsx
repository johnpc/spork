import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AcrosticRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({
  state: {} as { acrostics: AcrosticRecord[]; isLoading: boolean },
}));
vi.mock('./useAcrostics', () => ({ useAcrostics: () => hook.state }));

import { AcrosticList } from './AcrosticList';

const renderList = () =>
  render(
    <MemoryRouter>
      <AcrosticList />
    </MemoryRouter>,
  );

describe('AcrosticList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists acrostics with a link into play', () => {
    hook.state = {
      isLoading: false,
      acrostics: [{ id: 'a1', title: 'On Trying', difficulty: 'EASY' } as AcrosticRecord],
    };
    renderList();
    const link = screen.getByTestId('acrostic-link');
    expect(link).toHaveAttribute('href', '/acrostic/a1');
    expect(link).toHaveTextContent('On Trying');
  });

  it('shows an empty message when there are none', () => {
    hook.state = { isLoading: false, acrostics: [] };
    renderList();
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    hook.state = { isLoading: true, acrostics: [] };
    renderList();
    expect(screen.queryByTestId('acrostic-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('load-empty')).not.toBeInTheDocument();
  });
});
