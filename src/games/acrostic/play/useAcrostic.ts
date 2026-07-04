import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAcrostic } from './acrosticApi';
import { parseClues } from './parseClues';
import { isComplete, matchesAnswer, secretWord, wordSlots } from './acrosticEngine';

/**
 * Acrostic play engine: load the puzzle, hold the set of solved clue indices,
 * and reveal the hidden quote progressively as clues are solved. Wholly separate
 * from the quiz engine — its state is a set of solved indices, not a found set.
 */
export function useAcrostic(id: string | undefined) {
  const {
    data: acrostic,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['acrostic', id],
    queryFn: () => fetchAcrostic(id as string),
    enabled: !!id,
  });

  const clues = useMemo(() => parseClues(acrostic?.clues), [acrostic]);
  const quote = acrostic?.quote ?? '';

  const [solved, setSolved] = useState<ReadonlySet<number>>(new Set());
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  const complete = isComplete(solved, clues.length);
  const slots = useMemo(() => wordSlots(clues, solved), [clues, solved]);
  const secret = useMemo(() => secretWord(clues), [clues]);

  const guess = useCallback(
    (index: number, text: string, flagWrong = true): boolean => {
      if (gaveUp) return false;
      const answer = clues[index]?.answer;
      if (answer === undefined || solved.has(index)) return false;
      if (!matchesAnswer(text, answer)) {
        // Live typing checks silently (flagWrong=false); only an explicit
        // submit (Enter) marks the clue wrong, so partial input doesn't flash.
        if (flagWrong) setLastWrong(index);
        return false;
      }
      setLastWrong(null);
      setSolved((s) => new Set(s).add(index));
      return true;
    },
    [clues, solved, gaveUp],
  );

  const giveUp = useCallback(() => setGaveUp(true), []);

  const reset = useCallback(() => {
    setLastWrong(null);
    setSolved(new Set());
    setGaveUp(false);
  }, []);

  return {
    acrostic: acrostic ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    clues,
    quote,
    author: acrostic?.author ?? null,
    solved,
    slots,
    secret,
    solvedCount: solved.size,
    total: clues.length,
    complete,
    lastWrong,
    gaveUp,
    guess,
    giveUp,
    reset,
  };
}
