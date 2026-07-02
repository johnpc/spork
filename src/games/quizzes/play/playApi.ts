/**
 * Quiz play read path. The Quizzes game is guest-only, so quiz + answers are
 * read with the public per-call authMode (like decks/cards) and there is no
 * per-user server state — best scores live on the device (bestScoreStore).
 */
import {
  dataClient,
  readAuthMode,
  type QuizRecord,
  type AnswerRecord,
} from '../../../lib/dataClient';

export interface QuizData {
  quiz: QuizRecord | null;
  answers: AnswerRecord[];
}

/** The quiz (public read) + its answers in `ord` order (public read). */
export async function fetchQuizData(quizId: string): Promise<QuizData> {
  const authMode = await readAuthMode();
  const { data: quiz } = await dataClient.models.Quiz.get({ id: quizId }, { authMode });
  const { data: answers } = await dataClient.models.Answer.listAnswerByQuizIdAndOrd(
    { quizId },
    { limit: 1000, authMode },
  );
  return { quiz, answers };
}
