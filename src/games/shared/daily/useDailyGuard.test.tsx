import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDailyGuard } from './useDailyGuard';
import * as daily from './useDaily';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useDailyGuard', () => {
  it('returns the recap path once today is played', () => {
    vi.spyOn(daily, 'useDaily').mockReturnValue({
      date: '2026-07-03',
      playedToday: true,
      result: { score: 1, total: 1 },
      record: vi.fn(),
    });
    const { result } = renderHook(() => useDailyGuard('chess'));
    expect(result.current).toBe('/daily/chess');
  });

  it('returns null while not yet played (play normally)', () => {
    vi.spyOn(daily, 'useDaily').mockReturnValue({
      date: '2026-07-03',
      playedToday: false,
      result: null,
      record: vi.fn(),
    });
    expect(renderHook(() => useDailyGuard('quizzes:MAP')).result.current).toBeNull();
  });
});
