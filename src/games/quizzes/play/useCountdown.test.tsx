import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the full limit', () => {
    const { result } = renderHook(() => useCountdown(60, false, vi.fn()));
    expect(result.current.remaining).toBe(60);
  });

  it('ticks down while running and calls onExpire at zero', () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(
      ({ running }: { running: boolean }) => useCountdown(2, running, onExpire),
      { initialProps: { running: false } },
    );
    act(() => result.current.begin());
    rerender({ running: true });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(1);
    expect(onExpire).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.remaining).toBe(0);
    expect(onExpire).toHaveBeenCalled();
  });

  it('does not tick while not running', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown(30, false, onExpire));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.remaining).toBe(30);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
