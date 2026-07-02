import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useQuizGenForm } from './useQuizGenForm';

describe('useQuizGenForm', () => {
  it('defaults categorySlug to the first available once shelves load', async () => {
    const gen = vi.fn();
    const { result, rerender } = renderHook(({ slugs }) => useQuizGenForm(gen, slugs), {
      initialProps: { slugs: [] as string[] },
    });
    expect(result.current.categorySlug).toBe('');
    rerender({ slugs: ['geography', 'history'] });
    await waitFor(() => expect(result.current.categorySlug).toBe('geography'));
  });

  it('canSubmit only with a topic + category', () => {
    const { result } = renderHook(() => useQuizGenForm(vi.fn(), ['history']));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.setTopic('Presidents'));
    expect(result.current.canSubmit).toBe(true);
  });

  it('submits the full input and clears the topic', async () => {
    const gen = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useQuizGenForm(gen, ['history']));
    act(() => {
      result.current.setMode('MULTIPLE_CHOICE');
      result.current.setTopic('  Capitals  ');
      result.current.setAnswerCount(12);
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(gen).toHaveBeenCalledWith({
      mode: 'MULTIPLE_CHOICE',
      topicOrTemplate: 'Capitals',
      categorySlug: 'history',
      timeLimitSeconds: 120,
      answerCount: 12,
    });
    expect(result.current.topic).toBe('');
  });

  it('does not submit without a topic', async () => {
    const gen = vi.fn();
    const { result } = renderHook(() => useQuizGenForm(gen, ['history']));
    await act(async () => {
      await result.current.submit();
    });
    expect(gen).not.toHaveBeenCalled();
  });
});
