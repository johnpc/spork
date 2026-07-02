import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useElapsed } from './useElapsed';

describe('useElapsed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks up in whole seconds while not done', () => {
    let clock = 1000;
    const { result } = renderHook(() => useElapsed(false, () => clock));
    expect(result.current).toBe(0);
    act(() => {
      clock = 3500; // 2.5s later
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);
  });

  it('freezes at the final time once done', () => {
    let clock = 0;
    const { result, rerender } = renderHook(({ done }) => useElapsed(done, () => clock), {
      initialProps: { done: false },
    });
    act(() => {
      clock = 5000;
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(5);
    // Flip to done at 5s, then let the clock run — the value must not change.
    clock = 5000;
    rerender({ done: true });
    act(() => {
      clock = 30000;
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(5);
  });
});
