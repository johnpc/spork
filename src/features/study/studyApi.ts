/**
 * Study read/write paths. Cards are public (guest-readable); reviews are
 * per-user (owner authz, userPool). The queue merge is pure (buildStudyQueue);
 * grading computes sm2() on the client and upserts the review row.
 */
import {
  dataClient,
  readAuthMode,
  type CardRecord,
  type UserCardReviewRecord,
} from '../../lib/dataClient';
import { sm2, type Sm2State } from './sm2';

const USER_POOL = { authMode: 'userPool' } as const;

export interface StudyData {
  cards: CardRecord[];
  reviews: UserCardReviewRecord[];
}

/** The deck's cards (public read) + this user's reviews for it (owner read).
 * Guests have no reviews (SM-2 is signed-in only) — pass `withReviews: false` so
 * a guest studies the whole deck once without a userPool call that would fail. */
export async function fetchStudyData(deckId: string, withReviews = true): Promise<StudyData> {
  const authMode = await readAuthMode();
  const { data: cards } = await dataClient.models.Card.listCardByDeckIdAndOrd(
    { deckId },
    { limit: 500, authMode },
  );
  if (!withReviews) return { cards, reviews: [] };
  const { data: reviews } =
    await dataClient.models.UserCardReview.listUserCardReviewByDeckIdAndDueAt(
      { deckId },
      { limit: 500, ...USER_POOL },
    );
  return { cards, reviews };
}

/** Apply a self-grade: compute the next SM-2 state and upsert the review row. */
export async function gradeCard(
  deckId: string,
  cardId: string,
  prior: UserCardReviewRecord | null,
  grade: number,
  now: Date = new Date(),
): Promise<void> {
  const state: Sm2State = {
    easeFactor: prior?.easeFactor ?? 2.5,
    intervalDays: prior?.intervalDays ?? 0,
    repetitions: prior?.repetitions ?? 0,
  };
  const next = sm2(state, grade, now);
  const fields = { ...next, lastGrade: grade, lastReviewedAt: now.toISOString() };
  const { errors } = prior
    ? await dataClient.models.UserCardReview.update({ id: prior.id, ...fields }, USER_POOL)
    : await dataClient.models.UserCardReview.create({ cardId, deckId, ...fields }, USER_POOL);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to save review.');
}
