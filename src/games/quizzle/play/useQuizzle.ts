import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuizzle } from './quizzleApi';
import { parseQuestions } from './parseQuestions';
import {
  initSession,
  nextQuestion,
  placeWager,
  resolveGuess,
  type QuizzleSession,
} from './quizzleState';
import { type KeyValueStore } from './bestBankStore';
import { useBestBank } from './useBestBank';

const DEFAULT_BANK = 1000;

/** Quizzle play engine: load the puzzle, hold the wager session, and persist the
 * best final bank per-device. Wholly separate from the Quizzes engine — its
 * state is a bank you bet against, not a found set. */
export function useQuizzle(id: string | undefined, store: KeyValueStore) {
  const { data: quizzle, isLoading } = useQuery({
    queryKey: ['quizzle', id],
    queryFn: () => fetchQuizzle(id as string),
    enabled: !!id,
  });

  const questions = useMemo(() => parseQuestions(quizzle?.questions), [quizzle]);
  const startingBank = quizzle?.startingBank ?? DEFAULT_BANK;

  const [session, setSession] = useState<QuizzleSession>(() => initSession(DEFAULT_BANK));
  const [started, setStarted] = useState(false);

  const question = questions[session.index] ?? null;
  const done = session.stage === 'done' || (started && questions.length === 0);

  // Reads the saved best + persists the finished bank in an effect (not render).
  const best = useBestBank(store, id, done && started, session.bank);

  const start = useCallback(() => {
    setSession(initSession(startingBank));
    setStarted(true);
  }, [startingBank]);

  const wager = useCallback((amount: number) => setSession((s) => placeWager(s, amount)), []);
  const answer = useCallback(
    (guess: string) => question && setSession((s) => resolveGuess(s, guess, question)),
    [question],
  );
  const advance = useCallback(
    () => setSession((s) => nextQuestion(s, questions.length)),
    [questions.length],
  );

  return {
    quizzle: quizzle ?? null,
    isLoading: !!id && isLoading,
    topic: quizzle?.topic ?? '',
    questions,
    total: questions.length,
    question,
    started,
    bank: session.bank,
    startingBank,
    stage: session.stage,
    wagerAmount: session.wager,
    lastCorrect: session.lastCorrect,
    lastAnswer: session.lastAnswer,
    index: session.index,
    done,
    best,
    start,
    wager,
    answer,
    advance,
  };
}
