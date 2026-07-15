import { Link } from 'react-router-dom';
import { DeckCard } from './DeckCard';
import type { DeckCardData } from './composeDecks';

/** The inline horizontal preview of a category's decks (first 6) plus a "see
 * all" link when there are more. Presentational — the fetch/state gating lives
 * in CategorySection via LoadState. */
export function DeckRail({ decks, slug }: { decks: DeckCardData[]; slug: string }) {
  return (
    <>
      <div className="cat-section__rail">
        {decks.slice(0, 6).map((deck) => (
          <div key={deck.id} className="cat-section__item">
            <DeckCard deck={deck} />
          </div>
        ))}
      </div>
      {decks.length > 6 && (
        <Link to={`/discover/${slug}`} className="cat-section__all">
          See all {decks.length} decks →
        </Link>
      )}
    </>
  );
}
