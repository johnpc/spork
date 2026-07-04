import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBee } from './beeApi';
import { parseWordList } from './parseBee';
import { validateGuess, scoreWord, type ValidateResult } from './beeRules';

/** Shuffle helper (injected rng for deterministic tests). */
function shuffle<T>(arr: T[], rng = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Spelling Bee play engine: load puzzle, hold current input + found words, score. */
export function useSpellingBee(id: string | undefined, rng = Math.random) {
  const {
    data: bee,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['spellingbee', id],
    queryFn: () => fetchBee(id as string),
    enabled: !!id,
  });

  const letters = (bee?.letters ?? '').toLowerCase();
  const centerLetter = (bee?.centerLetter ?? '').toLowerCase();
  const answers = useMemo(() => parseWordList(bee?.answers), [bee]);
  const pangrams = useMemo(() => parseWordList(bee?.pangrams), [bee]);

  const [current, setCurrent] = useState('');
  const [found, setFound] = useState<string[]>([]);
  const [outerOrder, setOuterOrder] = useState<string[]>([]);

  useMemo(() => {
    if (letters && letters !== centerLetter && outerOrder.length === 0) {
      const outer = letters.split('').filter((l) => l !== centerLetter);
      setOuterOrder(shuffle(outer, rng));
    }
  }, [letters, centerLetter, outerOrder, rng]);

  const score = useMemo(
    () => found.reduce((sum, w) => sum + scoreWord(w, letters), 0),
    [found, letters],
  );

  const done = found.length > 0; // done = found at least one word

  const type = useCallback((letter: string) => {
    setCurrent((c) => c + letter);
  }, []);

  const backspace = useCallback(() => {
    setCurrent((c) => c.slice(0, -1));
  }, []);

  const shuffleOuter = useCallback(() => {
    setOuterOrder((o) => shuffle(o, rng));
  }, [rng]);

  const submit = useCallback((): ValidateResult => {
    const word = current.trim().toLowerCase();
    const result = validateGuess(word, {
      letters,
      centerLetter,
      answers,
      foundWords: found,
    });
    if (result.ok) {
      setFound((f) => [...f, word]);
      setCurrent('');
    }
    return result;
  }, [current, letters, centerLetter, answers, found]);

  return {
    bee: bee ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    letters,
    centerLetter,
    outerOrder,
    answers,
    pangrams,
    current,
    found,
    score,
    done,
    type,
    backspace,
    shuffleOuter,
    submit,
  };
}
