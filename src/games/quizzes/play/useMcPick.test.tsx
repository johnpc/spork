import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMcPick } from './useMcPick';
import type { AnswerRecord } from '../../../lib/dataClient';

const q = { id: 'a1', display: 'Paris', options: '[]' } as AnswerRecord;

describe('useMcPick', () => {
  it('scores a correct pick and flashes it green', () => {
    const attempt = vi.fn(() => true);
    const { result } = renderHook(() => useMcPick(q, attempt));
    act(() => result.current.choose('Paris'));
    expect(attempt).toHaveBeenCalledWith('a1');
    expect(result.current.optionState('Paris')).toBe('correct');
  });

  it('flashes a wrong pick red, reveals the correct one, and does not score', () => {
    const attempt = vi.fn(() => false);
    const { result } = renderHook(() => useMcPick(q, attempt));
    act(() => result.current.choose('Berlin'));
    expect(attempt).not.toHaveBeenCalled();
    expect(result.current.optionState('Berlin')).toBe('wrong');
    expect(result.current.optionState('Paris')).toBe('correct');
  });

  it('ignores a second pick while one is registered', () => {
    const attempt = vi.fn(() => false);
    const { result } = renderHook(() => useMcPick(q, attempt));
    act(() => result.current.choose('Berlin'));
    act(() => result.current.choose('Paris'));
    expect(attempt).not.toHaveBeenCalled(); // locked after first pick
  });

  it('resets the pick when the question changes', () => {
    const attempt = vi.fn(() => false);
    const { result, rerender } = renderHook(({ question }) => useMcPick(question, attempt), {
      initialProps: { question: q },
    });
    act(() => result.current.choose('Berlin'));
    expect(result.current.picked).toBe('Berlin');
    rerender({ question: { id: 'a2', display: 'Tokyo', options: '[]' } as AnswerRecord });
    expect(result.current.picked).toBeNull();
  });
});
