import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type State = ReturnType<typeof base>;
const base = () => ({
  deck: { id: 'd1', topic: 'Spanish' },
  cards: [{ id: 'c1', deckId: 'd1', ord: 0, front: 'Hola', back: 'Hello' }],
  isLoading: false,
  add: vi.fn(),
  edit: vi.fn(),
  remove: vi.fn(),
  move: vi.fn(),
});
const hook = vi.hoisted(() => ({ value: {} as State }));
vi.mock('./useAdminCards', () => ({ useAdminCards: () => hook.value }));
vi.mock('./AddCardForm', () => ({ AddCardForm: () => <div data-testid="add-card-form" /> }));
vi.mock('./CardEditorRow', () => ({ CardEditorRow: () => <li data-testid="card-edit" /> }));

import { DeckEditor } from './DeckEditor';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/admin/decks/d1']}>
      <Route path="/admin/decks/:id">
        <DeckEditor />
      </Route>
    </MemoryRouter>,
  );
}

describe('DeckEditor', () => {
  beforeEach(() => {
    hook.value = base();
  });

  it('renders the add form and one row per card', () => {
    renderAt();
    expect(screen.getByTestId('add-card-form')).toBeInTheDocument();
    expect(screen.getAllByTestId('card-edit')).toHaveLength(1);
  });

  it('shows an empty state when the deck has no cards', () => {
    hook.value = { ...base(), cards: [] };
    renderAt();
    expect(screen.getByTestId('no-cards')).toBeInTheDocument();
  });
});
