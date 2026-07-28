/**
 * Quiz play read path. The Quizzes game is guest-only, so quiz + answers are
 * read with the public per-call authMode (like decks/cards) and there is no
 * per-user server state — best scores live on the device (bestScoreStore).
 */
import {
  dataClient,
  readAuthMode,
  unwrap,
  type QuizRecord,
  type AnswerRecord,
} from '../../../lib/dataClient';

export interface QuizData {
  quiz: QuizRecord | null;
  answers: AnswerRecord[];
}

/** The quiz (public read) + its answers in `ord` order (public read). unwrap
 * throws on GraphQL errors so a transient failure surfaces as a retryable error
 * in usePlay, not a false "quiz not found" (quiz: null). */
export async function fetchQuizData(quizId: string): Promise<QuizData> {
  const authMode = await readAuthMode();
  const quiz = unwrap(await dataClient.models.Quiz.get({ id: quizId }, { authMode }));
  const answers = unwrap(
    await dataClient.models.Answer.listAnswerByQuizIdAndOrd({ quizId }, { limit: 1000, authMode }),
  );
  return { quiz, answers };
}
