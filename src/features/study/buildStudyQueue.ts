/**
 * Pure builder for a study session's card queue. Merges a deck's cards with the
 * user's review rows: a card with no review is NEW; a card whose review is due
 * (dueAt <= now) is DUE; a not-yet-due card is skipped. Order is new-first, then
 * due cards soonest-due first — so a session front-loads unseen + overdue work.
 */
import type { CardRecord, UserCardReviewRecord } from '../../lib/dataClient';

export interface QueuedCard {
  card: CardRecord;
  review: UserCardReviewRecord | null;
  isNew: boolean;
}

export function buildStudyQueue(
  cards: CardRecord[],
  reviews: UserCardReviewRecord[],
  now: Date,
): QueuedCard[] {
  const reviewByCard = new Map(reviews.map((r) => [r.cardId, r]));
  const nowIso = now.toISOString();

  const newCards: QueuedCard[] = [];
  const dueCards: QueuedCard[] = [];
  for (const card of cards) {
    const review = reviewByCard.get(card.id) ?? null;
    if (!review) {
      newCards.push({ card, review: null, isNew: true });
    } else if ((review.dueAt ?? '') <= nowIso) {
      dueCards.push({ card, review, isNew: false });
    }
  }
  dueCards.sort((a, b) => (a.review?.dueAt ?? '').localeCompare(b.review?.dueAt ?? ''));
  return [...newCards, ...dueCards];
}
