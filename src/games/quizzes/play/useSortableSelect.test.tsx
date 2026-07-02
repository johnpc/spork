import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSortableSelect } from './useSortableSelect';

describe('useSortableSelect', () => {
  it('picks and toggles an item', () => {
    const { result } = renderHook(() => useSortableSelect(() => true));
    act(() => result.current.pick('a1'));
    expect(result.current.selectedId).toBe('a1');
    act(() => result.current.pick('a1'));
    expect(result.current.selectedId).toBeNull();
  });

  it('clears the selection on a correct place', () => {
    const attempt = vi.fn(() => true);
    const { result } = renderHook(() => useSortableSelect(attempt));
    act(() => result.current.pick('a1'));
    act(() => result.current.place('Fruit'));
    expect(attempt).toHaveBeenCalledWith('a1', 'Fruit');
    expect(result.current.selectedId).toBeNull();
    expect(result.current.wrongBucket).toBeNull();
  });

  it('flags the wrong bucket + keeps the selection on a miss', () => {
    const attempt = vi.fn(() => false);
    const { result } = renderHook(() => useSortableSelect(attempt));
    act(() => result.current.pick('a1'));
    act(() => result.current.place('Vegetable'));
    expect(result.current.wrongBucket).toBe('Vegetable');
    expect(result.current.selectedId).toBe('a1');
  });

  it('does nothing when placing with no selection', () => {
    const attempt = vi.fn(() => true);
    const { result } = renderHook(() => useSortableSelect(attempt));
    let r = true;
    act(() => {
      r = result.current.place('Fruit');
    });
    expect(r).toBe(false);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('picking clears a prior wrong flag', () => {
    const { result } = renderHook(() => useSortableSelect(() => false));
    act(() => result.current.pick('a1'));
    act(() => result.current.place('Vegetable'));
    expect(result.current.wrongBucket).toBe('Vegetable');
    act(() => result.current.pick('a2'));
    expect(result.current.wrongBucket).toBeNull();
  });
});
