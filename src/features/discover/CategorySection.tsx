import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronForward } from 'ionicons/icons';
import { useDecks } from './useDecks';
import { DeckRail } from './DeckRail';
import { LoadState } from '../shell/LoadState';
import { Skeleton } from '../shell/Skeleton';
import type { Shelf } from './composeShelves';

/** A collapsible Discover section: a category header that, when open, previews
 * its published decks inline (horizontal scroll) so users don't have to drill
 * in to see what's inside. Decks load lazily the first time it's expanded; a
 * failed load surfaces a retry (via LoadState) instead of a false empty. */
export function CategorySection({
  shelf,
  defaultOpen = false,
}: {
  shelf: Shelf;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { data: decks, isLoading, isError, refetch } = useDecks(open ? shelf.slug : undefined);
  const railSkeleton = (
    <div className="cat-section__rail" aria-busy="true" aria-label="Loading decks">
      {[0, 1, 2].map((i) => (
        <div key={i} className="cat-section__item">
          <Skeleton height="7.5rem" radius="var(--sp-radius)" />
        </div>
      ))}
    </div>
  );

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
        {/* Decorative — the button's aria-expanded already conveys open/closed. */}
        <IonIcon
          className="cat-section__chevron"
          icon={open ? chevronDown : chevronForward}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="cat-section__body">
          <LoadState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && (decks ?? []).length === 0}
            emptyTitle="No decks here yet"
            onRetry={() => void refetch()}
            skeleton={railSkeleton}
          >
            <DeckRail decks={decks ?? []} slug={shelf.slug} />
          </LoadState>
        </div>
      )}
    </section>
  );
}
