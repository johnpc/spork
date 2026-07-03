import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useDailyEntry } from './useDailyEntry';
import { DAILY_GAMES } from './dailyGames';
import * as daily from './useDaily';

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useDailyEntry', () => {
  it('resolves today’s puzzle path when not yet played', async () => {
    vi.spyOn(daily, 'useDaily').mockReturnValue({
      date: '2026-07-02',
      playedToday: false,
      result: null,
      record: vi.fn(),
    });
    vi.spyOn(DAILY_GAMES.worldle, 'fetchList').mockResolvedValue([
      { id: 'old', puzzleDate: '2026-07-01' },
      { id: 'today', puzzleDate: '2026-07-02' },
    ]);
    const { result } = renderHook(() => useDailyEntry('worldle'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.playPath).toBe('/quizzes/today/play'));
    expect(result.current.playedToday).toBe(false);
  });

  it('reports playedToday with the recap result (no fetch)', () => {
    vi.spyOn(daily, 'useDaily').mockReturnValue({
      date: '2026-07-02',
      playedToday: true,
      result: { score: 3, total: 5 },
      record: vi.fn(),
    });
    const { result } = renderHook(() => useDailyEntry('steps'), { wrapper: wrapper() });
    expect(result.current.playedToday).toBe(true);
    expect(result.current.result).toEqual({ score: 3, total: 5 });
    expect(result.current.playPath).toBeNull();
  });

  it('returns no game for an unknown key', () => {
    vi.spyOn(daily, 'useDaily').mockReturnValue({
      date: '2026-07-02',
      playedToday: false,
      result: null,
      record: vi.fn(),
    });
    const { result } = renderHook(() => useDailyEntry('nope'), { wrapper: wrapper() });
    expect(result.current.game).toBeUndefined();
    expect(result.current.playPath).toBeNull();
  });
});
