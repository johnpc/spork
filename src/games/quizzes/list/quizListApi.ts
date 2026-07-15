/** Quizzes list read: published quizzes for the Quizzes home. Thin I/O; the
 * published-only filter is a pure helper so it's unit-tested without the client. */
import { dataClient, readAuthMode, unwrap, type QuizRecord } from '../../../lib/dataClient';
import { publishedQuizzes } from './composeQuizzes';

export async function fetchPublishedQuizzes(): Promise<QuizRecord[]> {
  // unwrap throws on GraphQL errors so a transient failure surfaces as an error
  // (retry) rather than a false "no puzzles today".
  const data = unwrap(
    await dataClient.models.Quiz.list({ limit: 200, authMode: await readAuthMode() }),
  );
  return publishedQuizzes(data);
}
