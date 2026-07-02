import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableSelect } from './useSortableSelect';

describe('useSortableSelect', () => {
  it('picks an item, then toggles it off when picked again', () => {
    const { result } = renderHook(() => useSortableSelect(() => true));
    act(() => result.current.pick('a'));
    expect(result.current.selectedId).toBe('a');
    act(() => result.current.pick('a'));
    expect(result.current.selectedId).toBeNull();
  });

  it('place with no selection is a no-op that returns false', () => {
    const attempt = vi.fn(() => true);
    const { result } = renderHook(() => useSortableSelect(attempt));
    let hit = true;
    act(() => {
      hit = result.current.place('Fruit');
    });
    expect(hit).toBe(false);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('placing a selected item in the correct bucket clears the selection', () => {
    const attempt = vi.fn(() => true);
    const { result } = renderHook(() => useSortableSelect(attempt));
    act(() => result.current.pick('a'));
    act(() => {
      result.current.place('Fruit');
    });
    expect(attempt).toHaveBeenCalledWith('a', 'Fruit');
    expect(result.current.selectedId).toBeNull();
  });

  it('a wrong bucket (miss) keeps the selection so the player can retry', () => {
    const attempt = vi.fn(() => false);
    const { result } = renderHook(() => useSortableSelect(attempt));
    act(() => result.current.pick('a'));
    act(() => {
      result.current.place('Vegetable');
    });
    expect(result.current.selectedId).toBe('a');
  });
});
