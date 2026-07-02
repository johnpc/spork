import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({
  fetchMyDecks: vi.fn(),
  fetchStudyData: vi.fn(),
  buildStudyQueue: vi.fn(),
}));
vi.mock('./myDecksApi', () => ({ fetchMyDecks: m.fetchMyDecks }));
vi.mock('../study/studyApi', () => ({ fetchStudyData: m.fetchStudyData }));
vi.mock('../study/buildStudyQueue', () => ({ buildStudyQueue: m.buildStudyQueue }));

import { fetchDueSummary } from './dueSummaryApi';

describe('fetchDueSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('counts due cards per saved deck and composes the summary', async () => {
    m.fetchMyDecks.mockResolvedValue([
      { deckId: 'd1', topic: 'Spanish' },
      { deckId: 'd2', topic: 'Greek' },
    ]);
    m.fetchStudyData.mockResolvedValue({ cards: [], reviews: [] });
    // d1 → 2 due, d2 → 0 due
    m.buildStudyQueue.mockReturnValueOnce([{}, {}]).mockReturnValueOnce([]);
    const summary = await fetchDueSummary(new Date('2026-06-10T00:00:00Z'));
    expect(summary.total).toBe(2);
    expect(summary.decks).toEqual([{ deckId: 'd1', topic: 'Spanish', dueCount: 2 }]);
  });

  it('returns an empty summary when no decks are saved', async () => {
    m.fetchMyDecks.mockResolvedValue([]);
    const summary = await fetchDueSummary();
    expect(summary).toEqual({ total: 0, decks: [] });
    expect(m.fetchStudyData).not.toHaveBeenCalled();
  });
});
