import { describe, it, expect } from 'vitest';
import { buildStudyQueue } from './buildStudyQueue';
import type { CardRecord, UserCardReviewRecord } from '../../lib/dataClient';

const NOW = new Date('2026-06-10T00:00:00.000Z');
const card = (id: string, ord: number): CardRecord =>
  ({ id, deckId: 'd1', ord, front: id, back: id }) as CardRecord;
const review = (cardId: string, dueAt: string): UserCardReviewRecord =>
  ({ cardId, deckId: 'd1', dueAt }) as UserCardReviewRecord;

describe('buildStudyQueue', () => {
  it('treats a card with no review as new', () => {
    const q = buildStudyQueue([card('a', 0)], [], NOW);
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ isNew: true, review: null });
  });

  it('includes a due review and excludes a not-yet-due one', () => {
    const cards = [card('due', 0), card('later', 1)];
    const reviews = [
      review('due', '2026-06-01T00:00:00.000Z'), // past -> due
      review('later', '2026-07-01T00:00:00.000Z'), // future -> skip
    ];
    const q = buildStudyQueue(cards, reviews, NOW);
    expect(q.map((x) => x.card.id)).toEqual(['due']);
    expect(q[0].isNew).toBe(false);
  });

  it('treats a review due exactly now as due', () => {
    const q = buildStudyQueue([card('a', 0)], [review('a', NOW.toISOString())], NOW);
    expect(q).toHaveLength(1);
    expect(q[0].isNew).toBe(false);
  });

  it('orders new cards first, then due cards soonest-due first', () => {
    const cards = [card('new', 0), card('dueLate', 1), card('dueEarly', 2)];
    const reviews = [
      review('dueLate', '2026-06-05T00:00:00.000Z'),
      review('dueEarly', '2026-06-02T00:00:00.000Z'),
    ];
    const q = buildStudyQueue(cards, reviews, NOW);
    expect(q.map((x) => x.card.id)).toEqual(['new', 'dueEarly', 'dueLate']);
  });

  it('returns an empty queue when nothing is new or due', () => {
    const q = buildStudyQueue([card('a', 0)], [review('a', '2026-07-01T00:00:00.000Z')], NOW);
    expect(q).toEqual([]);
  });

  it('includes not-yet-due cards in a review-all round', () => {
    const cards = [card('new', 0), card('later', 1)];
    const reviews = [review('later', '2026-07-01T00:00:00.000Z')]; // future
    // Default: only the new card. Review-all: both, new-first.
    expect(buildStudyQueue(cards, reviews, NOW).map((x) => x.card.id)).toEqual(['new']);
    expect(buildStudyQueue(cards, reviews, NOW, true).map((x) => x.card.id)).toEqual([
      'new',
      'later',
    ]);
  });
});
