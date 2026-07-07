import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ value: {} as { data?: unknown[]; isLoading: boolean } }));
vi.mock('./useDecks', () => ({ useDecks: () => hook.value }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));

import { CategoryDecks } from './CategoryDecks';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/discover/languages']}>
      <Route path="/discover/:slug">
        <CategoryDecks />
      </Route>
    </MemoryRouter>,
  );
}

describe('CategoryDecks', () => {
  beforeEach(() => {
    hook.value = { data: [], isLoading: false };
  });

  it('renders a DeckCard per deck', () => {
    hook.value = {
      data: [
        { id: 'd1', topic: 'Spanish Phrases', cardCount: 10, coverImagePath: null },
        { id: 'd2', topic: 'Greek Gods', cardCount: 20, coverImagePath: null },
      ],
      isLoading: false,
    };
    renderAt();
    expect(screen.getAllByTestId('deck-card')).toHaveLength(2);
  });

  it('shows a loading state', () => {
    hook.value = { data: undefined, isLoading: true };
    renderAt();
    expect(screen.getByLabelText(/loading decks/i)).toBeInTheDocument();
  });

  it('shows an empty state when the category has no decks', () => {
    hook.value = { data: [], isLoading: false };
    renderAt();
    expect(screen.getByTestId('empty-decks')).toBeInTheDocument();
  });
});
