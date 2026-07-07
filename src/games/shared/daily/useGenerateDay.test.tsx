import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ generateDailyPuzzles: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { mutations: { generateDailyPuzzles: m.generateDailyPuzzles } },
}));

import { useGenerateDay } from './useGenerateDay';

beforeEach(() => {
  vi.clearAllMocks();
  m.generateDailyPuzzles.mockResolvedValue({ data: { date: '2026-06-20', started: true } });
});

describe('useGenerateDay', () => {
  it('does nothing while inactive', () => {
    const { result } = renderHook(() => useGenerateDay('2026-06-20', false, false));
    expect(m.generateDailyPuzzles).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('fires the mutation once when active and reports generating', async () => {
    const { result, rerender } = renderHook(({ f }) => useGenerateDay('2026-06-20', true, f), {
      initialProps: { f: false },
    });
    await waitFor(() => expect(m.generateDailyPuzzles).toHaveBeenCalledWith({ puzzleDate: '2026-06-20' })); // prettier-ignore
    expect(result.current.isGenerating).toBe(true);
    // A re-render must not fire a second mutation (StrictMode/poll guard).
    rerender({ f: false });
    expect(m.generateDailyPuzzles).toHaveBeenCalledTimes(1);
  });

  it('flips to ready once the puzzle is found', async () => {
    const { result, rerender } = renderHook(({ f }) => useGenerateDay('2026-06-20', true, f), {
      initialProps: { f: false },
    });
    await waitFor(() => expect(result.current.isGenerating).toBe(true));
    rerender({ f: true });
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('reports an error when the mutation returns errors', async () => {
    m.generateDailyPuzzles.mockResolvedValue({ errors: [{ message: 'boom' }] });
    const { result } = renderHook(() => useGenerateDay('2026-06-20', true, false));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
