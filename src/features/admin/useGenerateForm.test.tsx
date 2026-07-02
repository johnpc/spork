import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGenerateForm } from './useGenerateForm';

const SLUGS = ['languages', 'mythology'];

describe('useGenerateForm', () => {
  it('defaults the category to the first real slug', () => {
    const { result } = renderHook(() => useGenerateForm(vi.fn().mockResolvedValue({}), SLUGS));
    expect(result.current.categorySlug).toBe('languages');
  });

  it('submits the full request and clears the topic', async () => {
    const generate = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useGenerateForm(generate, SLUGS));
    act(() => {
      result.current.setTopic('Greek Gods');
      result.current.setCategorySlug('mythology');
      result.current.setVoiceLanguage('en-US');
      result.current.setCardCount(15);
    });
    await act(async () => result.current.submit());
    expect(generate).toHaveBeenCalledWith({
      topic: 'Greek Gods',
      categorySlug: 'mythology',
      voiceLanguage: 'en-US',
      cardCount: 15,
    });
    await waitFor(() => expect(result.current.topic).toBe(''));
  });

  it('does nothing when the topic is blank', async () => {
    const generate = vi.fn();
    const { result } = renderHook(() => useGenerateForm(generate, SLUGS));
    await act(async () => result.current.submit());
    expect(generate).not.toHaveBeenCalled();
  });

  it('cannot submit when no categories are available', () => {
    const { result } = renderHook(() => useGenerateForm(vi.fn(), []));
    act(() => result.current.setTopic('x'));
    expect(result.current.canSubmit).toBe(false);
  });
});
