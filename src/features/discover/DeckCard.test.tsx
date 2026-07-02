import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

const media = vi.hoisted(() => ({ url: null as string | null }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => media.url }));

import { DeckCard } from './DeckCard';

const deck = { id: 'd1', topic: 'Spanish Phrases', cardCount: 12, coverImagePath: null };

function renderCard() {
  return render(
    <MemoryRouter>
      <DeckCard deck={deck} />
    </MemoryRouter>,
  );
}

describe('DeckCard', () => {
  it('renders topic, count and links to the deck', () => {
    media.url = null;
    renderCard();
    expect(screen.getByText('Spanish Phrases')).toBeInTheDocument();
    expect(screen.getByText('12 cards')).toBeInTheDocument();
    expect(screen.getByTestId('deck-card')).toHaveAttribute('href', '/decks/d1');
  });

  it('shows the cover image once its URL resolves', () => {
    media.url = 'https://s3/cover.png';
    const { container } = renderCard();
    // alt="" is decorative (no img role), so query the element directly.
    expect(container.querySelector('.deck-card__img')).toHaveAttribute(
      'src',
      'https://s3/cover.png',
    );
  });

  it('shows a placeholder when there is no cover', () => {
    media.url = null;
    const { container } = renderCard();
    expect(container.querySelector('.deck-card__placeholder')).toBeInTheDocument();
  });
});
