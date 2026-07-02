import { useDeckSave, type SaveDeckInput } from './useDeckSave';

/** Toggle button: add the deck to / remove it from the user's library. */
export function SaveDeckButton({ deck }: { deck: SaveDeckInput }) {
  const { isSaved, toggle, busy } = useDeckSave(deck);
  return (
    <button
      type="button"
      className="save-deck-btn"
      data-testid="save-deck"
      aria-pressed={isSaved}
      disabled={busy}
      onClick={toggle}
    >
      {isSaved ? 'In My Decks ✓' : 'Add to My Decks'}
    </button>
  );
}
