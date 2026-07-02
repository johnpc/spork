import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchStudyData: vi.fn(), gradeCard: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('./studyApi', () => api);
vi.mock('./useRecordOnDone', () => ({ useRecordOnDone: vi.fn() }));
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));

import { useStudy } from './useStudy';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const twoNewCards = {
  cards: [
    { id: 'c1', deckId: 'd1', ord: 0, front: 'a', back: 'A' },
    { id: 'c2', deckId: 'd1', ord: 1, front: 'b', back: 'B' },
  ],
  reviews: [],
};

describe('useStudy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
    api.gradeCard.mockResolvedValue(undefined);
  });

  it('does not load when signed out', () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(api.fetchStudyData).not.toHaveBeenCalled();
  });

  it('exposes the first queued card, its choices, and position', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    expect(result.current.position).toEqual({ index: 0, total: 2 });
    // Choices include the correct answer (back face, direction=front) + a distractor.
    expect(result.current.choices?.answer).toBe('A');
    expect(result.current.choices?.options).toEqual(expect.arrayContaining(['A', 'B']));
  });

  it('grades a correct pick as a pass (4)', async () => {
    api.fetchStudyData.mockResolvedValue({ ...twoNewCards, cards: [twoNewCards.cards[0]] });
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('A')); // correct (back of c1)
    expect(api.gradeCard).toHaveBeenCalledWith('d1', 'c1', null, 4);
    expect(result.current.picked).toBe('A');
  });

  it('grades a wrong pick as a lapse (1), then advances on next', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('B')); // wrong for c1 (whose answer is 'A')
    expect(api.gradeCard).toHaveBeenCalledWith('d1', 'c1', null, 1);
    act(() => result.current.next());
    await waitFor(() => expect(result.current.current?.card.id).toBe('c2'));
    expect(result.current.picked).toBeNull();
  });

  it('ignores a second answer on the same card (no double-grade)', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('A'));
    await act(async () => result.current.answer('B'));
    expect(api.gradeCard).toHaveBeenCalledTimes(1);
  });

  it('tallies the session score (correct out of answered)', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('A')); // c1 correct
    act(() => result.current.next());
    await waitFor(() => expect(result.current.current?.card.id).toBe('c2'));
    await act(async () => result.current.answer('A')); // c2 answer is 'B' -> wrong
    expect(result.current.score).toEqual({ correct: 1, total: 2 });
  });

  it('resets the score on reset and on toggleDirection', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('A'));
    expect(result.current.score.total).toBe(1);
    act(() => result.current.toggleDirection());
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
  });

  it('toggleDirection flips the prompt face and restarts from the first card', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.choices?.answer).toBe('A')); // back face
    act(() => result.current.next()); // move off the first card
    await waitFor(() => expect(result.current.current?.card.id).toBe('c2'));
    act(() => result.current.toggleDirection());
    expect(result.current.direction).toBe('back');
    expect(result.current.position.index).toBe(0); // restarted
    await waitFor(() => expect(result.current.choices?.answer).toBe('a')); // now front face
  });

  it('reset clears the pick and returns to the first card', async () => {
    api.fetchStudyData.mockResolvedValue(twoNewCards);
    const { result } = renderHook(() => useStudy('d1'), { wrapper });
    await waitFor(() => expect(result.current.current?.card.id).toBe('c1'));
    await act(async () => result.current.answer('A'));
    expect(result.current.picked).toBe('A');
    await act(async () => result.current.reset());
    expect(result.current.picked).toBeNull();
    expect(result.current.position.index).toBe(0);
  });
});
