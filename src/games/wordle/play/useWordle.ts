import { useCallback, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWordle } from './wordleApi';
import { scoreGuess, isWin, isGameOver } from './scoring';
import { isValidWord } from './wordleDictionary';

type GameStatus = 'playing' | 'won' | 'lost';

/** Wordle play engine: load puzzle, manage guesses, validate input, track status. */
export function useWordle(id: string | undefined) {
  const {
    data: puzzle,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['wordle', id],
    queryFn: () => fetchWordle(id as string),
    enabled: !!id,
  });

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [invalidWord, setInvalidWord] = useState(false);

  const answer = puzzle?.answer ?? '';
  const wordLength = puzzle?.wordLength ?? 5;
  const maxGuesses = puzzle?.maxGuesses ?? 6;

  const won = useMemo(
    () => guesses.length > 0 && isWin(scoreGuess(guesses[guesses.length - 1], answer)),
    [guesses, answer],
  );
  const gameOver = useMemo(() => isGameOver(guesses, maxGuesses, won), [guesses, maxGuesses, won]);
  const status: GameStatus = won ? 'won' : gameOver ? 'lost' : 'playing';

  const type = useCallback(
    (letter: string) => {
      if (gameOver || current.length >= wordLength) return;
      setCurrent((c) => c + letter.toLowerCase());
      setInvalidWord(false);
    },
    [gameOver, current.length, wordLength],
  );

  const backspace = useCallback(() => {
    setCurrent((c) => c.slice(0, -1));
    setInvalidWord(false);
  }, []);

  const submitGuess = useCallback(() => {
    if (gameOver || current.length !== wordLength) return;
    if (!isValidWord(current)) {
      setInvalidWord(true);
      return;
    }
    setGuesses((g) => [...g, current]);
    setCurrent('');
    setInvalidWord(false);
  }, [gameOver, current, wordLength]);

  return {
    puzzle: puzzle ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    guesses,
    current,
    status,
    won,
    gameOver,
    invalidWord,
    type,
    backspace,
    submitGuess,
  };
}
