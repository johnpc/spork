import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const decks = vi.hoisted(() => ({ value: { data: undefined as unknown, isLoading: false } }));
vi.mock('./useDecks', () => ({ useDecks: () => decks.value }));
vi.mock('./DeckCard', () => ({
  DeckCard: ({ deck }: { deck: { topic: string } }) => (
    <div data-testid="deck-card">{deck.topic}</div>
  ),
}));

import { CategorySection } from './CategorySection';

const shelf = { slug: 'languages', title: 'Languages', sortOrder: 1 };

function renderSection(defaultOpen = false) {
  return render(
    <MemoryRouter>
      <CategorySection shelf={shelf} defaultOpen={defaultOpen} />
    </MemoryRouter>,
  );
}

describe('CategorySection', () => {
  beforeEach(() => {
    decks.value = { data: [{ id: 'd1', topic: 'Spanish', cardCount: 3 }], isLoading: false };
  });

  it('is collapsed by default — no deck preview shown', () => {
    renderSection(false);
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.queryByTestId('deck-card')).not.toBeInTheDocument();
  });

  it('expands to preview decks when the header is clicked', () => {
    renderSection(false);
    fireEvent.click(screen.getByRole('button', { name: /Languages/ }));
    expect(screen.getByTestId('deck-card')).toHaveTextContent('Spanish');
  });

  it('starts open when defaultOpen and shows an empty hint with no decks', () => {
    decks.value = { data: [], isLoading: false };
    renderSection(true);
    expect(screen.getByTestId('cat-section-empty')).toBeInTheDocument();
  });

  it('links to the full category when there are more than the preview count', () => {
    decks.value = {
      data: Array.from({ length: 8 }, (_, i) => ({ id: `d${i}`, topic: `T${i}`, cardCount: 1 })),
      isLoading: false,
    };
    renderSection(true);
    expect(screen.getByRole('link', { name: /See all 8 decks/ })).toHaveAttribute(
      'href',
      '/discover/languages',
    );
  });
});
