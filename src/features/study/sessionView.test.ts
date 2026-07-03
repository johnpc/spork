import { describe, it, expect } from 'vitest';
import { sessionView, type StudyData } from './sessionView';
import type { CardRecord, UserCardReviewRecord } from '../../lib/dataClient';

const NOW = new Date('2026-06-10T00:00:00.000Z');
const card = (id: string, ord: number): CardRecord =>
  ({ id, deckId: 'd1', ord, front: id, back: id }) as CardRecord;
const review = (cardId: string, dueAt: string): UserCardReviewRecord =>
  ({ cardId, deckId: 'd1', dueAt }) as UserCardReviewRecord;

const twoNew: StudyData = { cards: [card('a', 0), card('b', 1)], reviews: [] };

describe('sessionView', () => {
  it('returns an empty view while loading (no data)', () => {
    const v = sessionView(undefined, 0, false, true, NOW);
    expect(v).toEqual({ queue: [], current: null, done: false, canReviewAll: false });
  });

  it('points current at the indexed card and flags done past the end', () => {
    expect(sessionView(twoNew, 0, false, false, NOW).current?.card.id).toBe('a');
    expect(sessionView(twoNew, 1, false, false, NOW).current?.card.id).toBe('b');
    const past = sessionView(twoNew, 2, false, false, NOW);
    expect(past.current).toBeNull();
    expect(past.done).toBe(true);
  });

  it('offers Review all when cards exist but none are due', () => {
    const future = '2999-01-01T00:00:00.000Z';
    const data: StudyData = {
      cards: [card('a', 0)],
      reviews: [review('a', future)],
    };
    const v = sessionView(data, 0, false, false, NOW);
    expect(v.queue).toHaveLength(0);
    expect(v.canReviewAll).toBe(true);
  });

  it('does not offer Review all once already in a review-all round', () => {
    const future = '2999-01-01T00:00:00.000Z';
    const data: StudyData = { cards: [card('a', 0)], reviews: [review('a', future)] };
    const v = sessionView(data, 0, true, false, NOW);
    expect(v.queue).toHaveLength(1); // the not-yet-due card is now included
    expect(v.canReviewAll).toBe(false);
  });

  it('does not offer Review all when there are no cards at all', () => {
    const v = sessionView({ cards: [], reviews: [] }, 0, false, false, NOW);
    expect(v.canReviewAll).toBe(false);
  });
});
