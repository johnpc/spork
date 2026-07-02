import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNewDeckForm } from './useNewDeckForm';

const SLUGS = ['languages', 'mythology'];

describe('useNewDeckForm', () => {
  it('defaults the category to the first real slug once available', () => {
    const { result } = renderHook(() => useNewDeckForm(vi.fn().mockResolvedValue('id'), SLUGS));
    expect(result.current.categorySlug).toBe('languages');
  });

  it('cannot submit without a category (none loaded yet)', () => {
    const { result } = renderHook(() => useNewDeckForm(vi.fn(), []));
    act(() => result.current.setTopic('Greek Gods'));
    expect(result.current.canSubmit).toBe(false); // no category available
  });

  it('creates the deck and clears the topic on submit', async () => {
    const create = vi.fn().mockResolvedValue('id');
    const { result } = renderHook(() => useNewDeckForm(create, SLUGS));
    act(() => {
      result.current.setTopic('Greek Gods');
      result.current.setCategorySlug('mythology');
    });
    expect(result.current.canSubmit).toBe(true);
    await act(async () => result.current.submit());
    expect(create).toHaveBeenCalledWith({ topic: 'Greek Gods', categorySlug: 'mythology' });
    await waitFor(() => expect(result.current.topic).toBe(''));
  });

  it('does nothing when the topic is blank', async () => {
    const create = vi.fn();
    const { result } = renderHook(() => useNewDeckForm(create, SLUGS));
    act(() => result.current.setTopic('   '));
    await act(async () => result.current.submit());
    expect(create).not.toHaveBeenCalled();
  });
});
