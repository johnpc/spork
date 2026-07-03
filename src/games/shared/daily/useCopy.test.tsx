import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCopy } from './useCopy';

describe('useCopy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes to the clipboard and flashes copied for ~1.5s', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } } as unknown as Navigator);

    const { result } = renderHook(() => useCopy());
    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.copied).toBe(true);

    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.copied).toBe(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('stays un-copied when no clipboard is available', async () => {
    vi.stubGlobal('navigator', {} as unknown as Navigator);
    const { result } = renderHook(() => useCopy());
    act(() => result.current.copy('x'));
    await waitFor(() => expect(result.current.copied).toBe(false));
    vi.unstubAllGlobals();
  });
});
