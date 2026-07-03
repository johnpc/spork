import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLadder } from './ladderApi';
import { parseWordList } from './parseLadder';
import { checkStep, isSolved, parMoves, type StepCheck } from './ladder';

/**
 * Word-ladder play engine: load the puzzle, hold the path built so far, and
 * apply single-letter steps validated by the pure `checkStep`. Wholly separate
 * from the quiz engine — its state is an ordered path of words, not a found set.
 */
export function useLadder(id: string | undefined) {
  const {
    data: ladder,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['ladder', id],
    queryFn: () => fetchLadder(id as string),
    enabled: !!id,
  });

  const dictionary = useMemo(() => new Set(parseWordList(ladder?.dictionary)), [ladder]);
  const start = (ladder?.start ?? '').toLowerCase();
  const target = (ladder?.target ?? '').toLowerCase();
  const par = useMemo(() => parMoves(parseWordList(ladder?.parPath)), [ladder]);

  const [path, setPath] = useState<string[]>([]);
  // The ladder always begins at `start`; the path holds the words added since.
  const full = useMemo(() => (start ? [start, ...path] : path), [start, path]);
  const current = full[full.length - 1] ?? '';
  const used = useMemo(() => new Set(full), [full]);
  const solved = !!target && isSolved(current, target);

  const [lastError, setLastError] = useState<StepCheck['reason'] | null>(null);

  const submit = useCallback(
    (word: string): boolean => {
      if (solved) return false;
      const next = word.trim().toLowerCase();
      const check = checkStep(current, next, dictionary, used);
      if (!check.ok) {
        setLastError(check.reason ?? null);
        return false;
      }
      setLastError(null);
      setPath((p) => [...p, next]);
      return true;
    },
    [solved, current, dictionary, used],
  );

  const undo = useCallback(() => {
    setLastError(null);
    setPath((p) => p.slice(0, -1));
  }, []);
  const reset = useCallback(() => {
    setLastError(null);
    setPath([]);
  }, []);

  return {
    ladder: ladder ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    start,
    target,
    par,
    path: full,
    current,
    moves: path.length,
    solved,
    lastError,
    submit,
    undo,
    reset,
  };
}
