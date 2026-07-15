import { checkmarkDoneCircleOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { EmptyState } from '../shell/EmptyState';

/** The end-of-session state: either "session complete" with a score, or the
 * "all caught up" nudge when nothing was due. Not a failed load — a legitimate
 * terminal state — so it lives outside LoadState. Presentational. */
export function StudyDone({
  deckId,
  score,
  canReviewAll,
  onReviewAll,
}: {
  deckId?: string;
  score: { correct: number; total: number };
  canReviewAll: boolean;
  onReviewAll: () => void;
}) {
  return (
    <EmptyState
      icon={checkmarkDoneCircleOutline}
      title={score.total > 0 ? 'Session complete!' : 'All caught up!'}
      message={
        score.total > 0
          ? `You got ${score.correct} of ${score.total} correct.`
          : 'No cards are due right now. Come back later to keep your streak going.'
      }
      testId="study-done"
    >
      {score.total > 0 && (
        <p className="study__score" data-testid="study-score">
          {Math.round((score.correct / score.total) * 100)}%
        </p>
      )}
      {canReviewAll && (
        <button
          type="button"
          className="empty-state__cta"
          data-testid="study-review-all"
          onClick={onReviewAll}
        >
          Review all cards
        </button>
      )}
      <Link to={`/decks/${deckId}`} className="empty-state__cta study__back-link">
        Back to deck
      </Link>
    </EmptyState>
  );
}
