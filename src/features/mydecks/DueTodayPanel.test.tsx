import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ value: {} as { summary: unknown; isLoading: boolean } }));
vi.mock('./useDueSummary', () => ({ useDueSummary: () => hook.value }));

import { DueTodayPanel } from './DueTodayPanel';

function renderPanel() {
  return render(
    <MemoryRouter>
      <DueTodayPanel />
    </MemoryRouter>,
  );
}

describe('DueTodayPanel', () => {
  beforeEach(() => {
    hook.value = { summary: null, isLoading: false };
  });

  it('renders nothing when nothing is due', () => {
    hook.value = { summary: { total: 0, decks: [] }, isLoading: false };
    const { container } = renderPanel();
    expect(container.firstChild).toBeNull();
  });

  it('shows the total and a study link per due deck', () => {
    hook.value = {
      summary: {
        total: 7,
        decks: [
          { deckId: 'd1', topic: 'Spanish', dueCount: 5 },
          { deckId: 'd2', topic: 'Greek', dueCount: 2 },
        ],
      },
      isLoading: false,
    };
    renderPanel();
    expect(screen.getByTestId('due-today')).toHaveTextContent('7');
    expect(screen.getAllByTestId('due-deck')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Spanish/ })).toHaveAttribute(
      'href',
      '/decks/d1/study',
    );
  });

  it('renders nothing while loading', () => {
    hook.value = { summary: null, isLoading: true };
    const { container } = renderPanel();
    expect(container.firstChild).toBeNull();
  });
});
