import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSpellingBee } from './useSpellingBee';
import * as beeApi from './beeApi';

vi.mock('./beeApi');

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useSpellingBee', () => {
  it('loads a puzzle', async () => {
    vi.mocked(beeApi.fetchBee).mockResolvedValue({
      id: '1',
      letters: 'abcdefg',
      centerLetter: 'd',
      answers: '["abcd","defg"]',
      pangrams: '["abcdefg"]',
      status: 'PUBLISHED',
      publishedAt: '',
      puzzleDate: '',
    } as never);

    const { result } = renderHook(() => useSpellingBee('1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.letters).toBe('abcdefg');
    expect(result.current.centerLetter).toBe('d');
    expect(result.current.answers).toEqual(['abcd', 'defg']);
  });

  it('types letters and builds current input', () => {
    vi.mocked(beeApi.fetchBee).mockResolvedValue(null);
    const { result } = renderHook(() => useSpellingBee(undefined), { wrapper: wrapper() });
    act(() => result.current.type('a'));
    act(() => result.current.type('b'));
    expect(result.current.current).toBe('ab');
  });

  it('backspaces the current input', () => {
    vi.mocked(beeApi.fetchBee).mockResolvedValue(null);
    const { result } = renderHook(() => useSpellingBee(undefined), { wrapper: wrapper() });
    act(() => result.current.type('a'));
    act(() => result.current.type('b'));
    act(() => result.current.backspace());
    expect(result.current.current).toBe('a');
  });

  it('submits a valid word and updates found + score', async () => {
    vi.mocked(beeApi.fetchBee).mockResolvedValue({
      id: '1',
      letters: 'abcdefg',
      centerLetter: 'd',
      answers: '["abcd"]',
      pangrams: '[]',
      status: 'PUBLISHED',
      publishedAt: '',
      puzzleDate: '',
    } as never);

    const { result } = renderHook(() => useSpellingBee('1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.type('a'));
    act(() => result.current.type('b'));
    act(() => result.current.type('c'));
    act(() => result.current.type('d'));

    let res: ReturnType<typeof result.current.submit> | undefined;
    act(() => {
      res = result.current.submit();
    });
    expect(res?.ok).toBe(true);
    expect(result.current.found).toEqual(['abcd']);
    expect(result.current.score).toBe(1);
    expect(result.current.current).toBe('');
  });

  it('rejects an invalid word', async () => {
    vi.mocked(beeApi.fetchBee).mockResolvedValue({
      id: '1',
      letters: 'abcdefg',
      centerLetter: 'd',
      answers: '["abcd"]',
      pangrams: '[]',
      status: 'PUBLISHED',
      publishedAt: '',
      puzzleDate: '',
    } as never);

    const { result } = renderHook(() => useSpellingBee('1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.type('x'));
    act(() => result.current.type('y'));
    act(() => result.current.type('z'));
    act(() => result.current.type('d'));

    let res: ReturnType<typeof result.current.submit> | undefined;
    act(() => {
      res = result.current.submit();
    });
    expect(res?.ok).toBe(false);
    expect(result.current.found).toEqual([]);
  });
});
