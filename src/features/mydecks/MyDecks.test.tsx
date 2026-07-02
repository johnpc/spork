import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type MyDecksState = { decks: unknown[]; isLoading: boolean; isAuthenticated: boolean };
const hook = vi.hoisted(() => ({ value: {} as MyDecksState }));
vi.mock('./useMyDecks', () => ({ useMyDecks: () => hook.value }));
// DueTodayPanel does its own cross-deck fetch — stub it out of this list test.
vi.mock('./DueTodayPanel', () => ({ DueTodayPanel: () => null }));

import { MyDecks } from './MyDecks';

function renderMyDecks() {
  return render(
    <MemoryRouter>
      <MyDecks />
    </MemoryRouter>,
  );
}

describe('MyDecks', () => {
  beforeEach(() => {
    hook.value = { decks: [], isLoading: false, isAuthenticated: true };
  });

  it('prompts sign-in when signed out', () => {
    hook.value = { decks: [], isLoading: false, isAuthenticated: false };
    renderMyDecks();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
  });

  it('shows an empty state when authenticated with no decks', () => {
    renderMyDecks();
    expect(screen.getByTestId('empty-my-decks')).toBeInTheDocument();
  });

  it('lists saved decks linking to the deck detail', () => {
    hook.value = {
      decks: [{ id: '1', deckId: 'd1', topic: 'Spanish', cardCount: 3 }],
      isLoading: false,
      isAuthenticated: true,
    };
    renderMyDecks();
    expect(screen.getByTestId('my-deck')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Spanish/ })).toHaveAttribute('href', '/decks/d1');
  });
});
