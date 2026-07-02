import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ value: {} as { data?: unknown; isLoading: boolean } }));
vi.mock('./useDeckDetail', () => ({ useDeckDetail: () => hook.value }));
// SaveDeckButton pulls in auth/router state — stub it to a marker.
vi.mock('../stats/DeckMastery', () => ({ DeckMastery: () => null }));
vi.mock('../mydecks/SaveDeckButton', () => ({
  SaveDeckButton: () => <button data-testid="save-deck">Add to My Decks</button>,
}));

import { DeckDetail } from './DeckDetail';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/decks/d1']}>
      <Route path="/decks/:id">
        <DeckDetail />
      </Route>
    </MemoryRouter>,
  );
}

describe('DeckDetail', () => {
  beforeEach(() => {
    hook.value = { data: undefined, isLoading: true };
  });

  it('shows a loading state', () => {
    renderAt();
    expect(screen.getByText(/loading deck/i)).toBeInTheDocument();
  });

  it('renders the deck title, save button and card rows', () => {
    hook.value = {
      data: {
        deck: { id: 'd1', topic: 'Spanish', description: 'Phrases', cardCount: 2 },
        cards: [
          { id: 'c1', front: 'Hola', back: 'Hi' },
          { id: 'c2', front: 'Adiós', back: 'Bye' },
        ],
      },
      isLoading: false,
    };
    renderAt();
    expect(screen.getByTestId('deck-title')).toHaveTextContent('Spanish');
    expect(screen.getByTestId('save-deck')).toBeInTheDocument();
    expect(screen.getAllByTestId('card-row')).toHaveLength(2);
  });

  it('shows a not-found message when the deck is missing', () => {
    hook.value = { data: null, isLoading: false };
    renderAt();
    expect(screen.getByText(/deck not found/i)).toBeInTheDocument();
  });
});
