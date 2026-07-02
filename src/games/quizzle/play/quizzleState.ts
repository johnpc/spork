/** Pure Quizzle session state + transitions. The hook owns React wiring; this
 * owns the game math so it's deterministic and unit-tested in isolation. A
 * session walks question-by-question: stage 'wager' (set the stake) → stage
 * 'answer' (type a guess) → resolve → next, ending when questions run out. */
import { applyWager, clampWager, isCorrect, type QuizzleQuestion } from './quizzleEngine';

export interface QuizzleSession {
  index: number;
  bank: number;
  stage: 'wager' | 'answer' | 'done';
  wager: number;
  lastCorrect: boolean | null;
  lastAnswer: string | null;
}

export function initSession(startingBank: number): QuizzleSession {
  return {
    index: 0,
    bank: startingBank,
    stage: 'wager',
    wager: 1,
    lastCorrect: null,
    lastAnswer: null,
  };
}

/** Lock in a wager (clamped to [1, bank]) and move to the answer stage. */
export function placeWager(s: QuizzleSession, wager: number): QuizzleSession {
  if (s.stage !== 'wager') return s;
  return { ...s, wager: clampWager(wager, s.bank), stage: 'answer', lastCorrect: null };
}

/** Resolve the typed guess against the current question, updating the bank. */
export function resolveGuess(
  s: QuizzleSession,
  guess: string,
  question: QuizzleQuestion,
): QuizzleSession {
  if (s.stage !== 'answer') return s;
  const correct = isCorrect(guess, question);
  return {
    ...s,
    bank: applyWager(s.bank, s.wager, correct),
    lastCorrect: correct,
    lastAnswer: question.answer,
    stage: 'answer',
  };
}

/** Advance to the next question, or finish when none remain / bank is empty. */
export function nextQuestion(s: QuizzleSession, total: number): QuizzleSession {
  const index = s.index + 1;
  const done = index >= total || s.bank <= 0;
  return {
    ...s,
    index,
    stage: done ? 'done' : 'wager',
    wager: 1,
    lastCorrect: null,
    lastAnswer: null,
  };
}
