import { useQuery } from '@tanstack/react-query';
import { dataClient } from '../../lib/dataClient';
import { useAuth } from '../auth/useAuth';
import { computeMastery } from './mastery';
import './streak.css';

/** Per-deck mastery bar, derived live from the user's review rows. Hidden for
 * guests and until at least one card is mastered (nothing to celebrate yet). */
export function DeckMastery({ deckId, cardCount }: { deckId: string; cardCount: number }) {
  const { status } = useAuth();
  const enabled = status === 'authenticated';
  const { data } = useQuery({
    queryKey: ['deck-mastery', deckId],
    queryFn: async () => {
      const { data: reviews } =
        await dataClient.models.UserCardReview.listUserCardReviewByDeckIdAndDueAt(
          { deckId },
          { limit: 1000, authMode: 'userPool' },
        );
      return computeMastery(reviews, cardCount);
    },
    enabled,
    staleTime: 30_000,
  });
  if (!data || data.mastered === 0) return null;
  return (
    <div className="mastery" data-testid="deck-mastery">
      <div className="mastery__row">
        <span className="fs-kicker">Mastery</span>
        <span className="mastery__count">
          {data.mastered}/{data.total} · {data.percent}%
        </span>
      </div>
      <div className="mastery__bar">
        <div className="mastery__fill" style={{ width: `${data.percent}%` }} />
      </div>
    </div>
  );
}
