/** Quizzes list read: published quizzes for the Quizzes home. Thin I/O; the
 * published-only filter is a pure helper so it's unit-tested without the client. */
import { dataClient, readAuthMode, type QuizRecord } from '../../../lib/dataClient';
import { publishedQuizzes } from './composeQuizzes';

export async function fetchPublishedQuizzes(): Promise<QuizRecord[]> {
  const { data } = await dataClient.models.Quiz.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedQuizzes(data);
}
