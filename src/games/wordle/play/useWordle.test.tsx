import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchWordle: vi.fn() }));
vi.mock('./wordleApi', () => api);

const dict = vi.hoisted(() => ({ isValidWord: vi.fn() }));
vi.mock('./wordleDictionary', () => dict);

import { useWordle } from './useWordle';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const puzzle = {
  id: 'w1',
  answer: 'crane',
  wordLength: 5,
  maxGuesses: 6,
  status: 'PUBLISHED',
};

describe('useWordle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchWordle.mockResolvedValue(puzzle);
    dict.isValidWord.mockReturnValue(true);
  });

  it('loads the puzzle and starts at playing state', async () => {
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    expect(result.current.puzzle?.answer).toBe('crane');
    expect(result.current.status).toBe('playing');
    expect(result.current.guesses).toEqual([]);
  });

  it('types letters and submits a valid guess', async () => {
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      result.current.type('c');
      result.current.type('r');
      result.current.type('a');
      result.current.type('n');
      result.current.type('e');
    });
    expect(result.current.current).toBe('crane');
    act(() => result.current.submitGuess());
    expect(result.current.guesses).toEqual(['crane']);
    expect(result.current.status).toBe('won');
  });

  it('rejects an invalid word and shows error', async () => {
    dict.isValidWord.mockReturnValue(false);
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      'zzzzz'.split('').forEach((l) => result.current.type(l));
    });
    act(() => result.current.submitGuess());
    expect(result.current.guesses).toEqual([]);
    expect(result.current.invalidWord).toBe(true);
  });

  it('backspaces a letter', async () => {
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      result.current.type('c');
      result.current.type('a');
      result.current.backspace();
    });
    expect(result.current.current).toBe('c');
  });

  it('prevents submission when length is wrong', async () => {
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      result.current.type('c');
      result.current.type('a');
    });
    act(() => result.current.submitGuess());
    expect(result.current.guesses).toEqual([]);
  });

  it('reaches lost status after max guesses', async () => {
    dict.isValidWord.mockReturnValue(true);
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    const wrongWords = ['hello', 'world', 'pizza', 'quest', 'magic', 'space'];
    wrongWords.forEach((word) => {
      act(() => {
        word.split('').forEach((l) => result.current.type(l));
      });
      act(() => result.current.submitGuess());
    });
    expect(result.current.guesses).toHaveLength(6);
    expect(result.current.status).toBe('lost');
    expect(result.current.gameOver).toBe(true);
  });

  it('prevents typing beyond word length', async () => {
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    'cranex'.split('').forEach((l) => {
      act(() => result.current.type(l));
    });
    expect(result.current.current).toBe('crane');
  });

  it('prevents actions when game is over', async () => {
    dict.isValidWord.mockReturnValue(true);
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      'crane'.split('').forEach((l) => result.current.type(l));
    });
    act(() => result.current.submitGuess());
    expect(result.current.status).toBe('won');
    act(() => result.current.type('h'));
    expect(result.current.current).toBe('');
  });

  it('clears invalidWord flag on type', async () => {
    dict.isValidWord.mockReturnValue(false);
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      'zzzzz'.split('').forEach((l) => result.current.type(l));
    });
    act(() => result.current.submitGuess());
    expect(result.current.invalidWord).toBe(true);
    act(() => result.current.backspace());
    act(() => result.current.type('a'));
    expect(result.current.invalidWord).toBe(false);
  });

  it('clears invalidWord flag on backspace', async () => {
    dict.isValidWord.mockReturnValue(false);
    const { result } = renderHook(() => useWordle('w1'), { wrapper });
    await waitFor(() => expect(result.current.puzzle).toBeTruthy());
    act(() => {
      'zzzzz'.split('').forEach((l) => result.current.type(l));
    });
    act(() => result.current.submitGuess());
    expect(result.current.invalidWord).toBe(true);
    act(() => result.current.backspace());
    expect(result.current.invalidWord).toBe(false);
  });

  it('handles undefined id gracefully', () => {
    const { result } = renderHook(() => useWordle(undefined), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.puzzle).toBeNull();
  });
});
