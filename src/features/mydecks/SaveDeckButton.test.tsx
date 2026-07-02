import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const save = vi.hoisted(() => ({ value: { isSaved: false, toggle: vi.fn(), busy: false } }));
vi.mock('./useDeckSave', () => ({ useDeckSave: () => save.value }));

import { SaveDeckButton } from './SaveDeckButton';

const deck = { deckId: 'd1', topic: 'A' };

describe('SaveDeckButton', () => {
  beforeEach(() => {
    save.value = { isSaved: false, toggle: vi.fn(), busy: false };
  });

  it('shows the add label and toggles on click', () => {
    render(<SaveDeckButton deck={deck} />);
    const btn = screen.getByTestId('save-deck');
    expect(btn).toHaveTextContent('Add to My Decks');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    btn.click();
    expect(save.value.toggle).toHaveBeenCalled();
  });

  it('reflects saved state', () => {
    save.value = { isSaved: true, toggle: vi.fn(), busy: false };
    render(<SaveDeckButton deck={deck} />);
    const btn = screen.getByTestId('save-deck');
    expect(btn).toHaveTextContent('In My Decks');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('is disabled while busy', () => {
    save.value = { isSaved: false, toggle: vi.fn(), busy: true };
    render(<SaveDeckButton deck={deck} />);
    expect(screen.getByTestId('save-deck')).toBeDisabled();
  });
});
