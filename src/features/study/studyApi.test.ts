import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({
  listCards: vi.fn(),
  listReviews: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    models: {
      Card: { listCardByDeckIdAndOrd: m.listCards },
      UserCardReview: {
        listUserCardReviewByDeckIdAndDueAt: m.listReviews,
        create: m.create,
        update: m.update,
      },
    },
  },
  readAuthMode: () => Promise.resolve('userPool'),
}));

import { fetchStudyData, gradeCard } from './studyApi';

const NOW = new Date('2026-06-01T00:00:00.000Z');

describe('studyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ errors: null });
    m.update.mockResolvedValue({ errors: null });
  });

  it('fetchStudyData reads cards (public) and reviews (userPool)', async () => {
    m.listCards.mockResolvedValue({ data: [{ id: 'c1', ord: 0 }] });
    m.listReviews.mockResolvedValue({ data: [{ id: 'r1', cardId: 'c1' }] });
    const out = await fetchStudyData('d1');
    expect(out.cards).toHaveLength(1);
    expect(m.listReviews).toHaveBeenCalledWith(
      { deckId: 'd1' },
      expect.objectContaining({ authMode: 'userPool' }),
    );
  });

  it('gradeCard creates a review row for a first-time (new) card', async () => {
    await gradeCard('d1', 'c1', null, 4, NOW);
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: 'c1', deckId: 'd1', repetitions: 1, lastGrade: 4 }),
      { authMode: 'userPool' },
    );
  });

  it('gradeCard updates the existing review row for a tracked card', async () => {
    const prior = { id: 'r1', easeFactor: 2.5, intervalDays: 6, repetitions: 2 } as never;
    await gradeCard('d1', 'c1', prior, 5, NOW);
    expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1', repetitions: 3 }), {
      authMode: 'userPool',
    });
    expect(m.create).not.toHaveBeenCalled();
  });

  it('gradeCard throws when the upsert errors', async () => {
    m.create.mockResolvedValue({ errors: [{ message: 'denied' }] });
    await expect(gradeCard('d1', 'c1', null, 3, NOW)).rejects.toThrow('denied');
  });
});
