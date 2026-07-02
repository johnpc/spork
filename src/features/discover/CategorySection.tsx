import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronForward } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { useDecks } from './useDecks';
import { DeckCard } from './DeckCard';
import type { Shelf } from './composeShelves';

/** A collapsible Discover section: a category header that, when open, previews
 * its published decks inline (horizontal scroll) so users don't have to drill
 * in to see what's inside. Decks load lazily the first time it's expanded. */
export function CategorySection({
  shelf,
  defaultOpen = false,
}: {
  shelf: Shelf;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { data: decks, isLoading } = useDecks(open ? shelf.slug : undefined);

  return (
    <section className="cat-section" data-testid="cat-section">
      <button
        type="button"
        className="cat-section__header"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ ['--cat' as string]: `var(--sp-cat-${shelf.slug}, var(--sp-accent))` }}
      >
        <span className="discover__dot" aria-hidden="true" />
        <span className="cat-section__title">{shelf.title}</span>
        <IonIcon className="cat-section__chevron" icon={open ? chevronDown : chevronForward} />
      </button>
      {open && (
        <div className="cat-section__body">
          {isLoading ? (
            <p className="sp-muted cat-section__hint">Loading decks…</p>
          ) : decks && decks.length > 0 ? (
            <>
              <div className="cat-section__rail">
                {decks.slice(0, 6).map((deck) => (
                  <div key={deck.id} className="cat-section__item">
                    <DeckCard deck={deck} />
                  </div>
                ))}
              </div>
              {decks.length > 6 && (
                <Link to={`/discover/${shelf.slug}`} className="cat-section__all">
                  See all {decks.length} decks →
                </Link>
              )}
            </>
          ) : (
            <p className="sp-muted cat-section__hint" data-testid="cat-section-empty">
              No decks here yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
