/** Pure shaping for the quizzes list: keep only PUBLISHED quizzes, newest first
 * (by publishedAt, falling back to createdAt). Pure + deterministic → unit-tested
 * without the Amplify client. */
import type { QuizRecord } from '../../../lib/dataClient';

export function publishedQuizzes(quizzes: QuizRecord[]): QuizRecord[] {
  return quizzes
    .filter((q) => q.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(q: QuizRecord): string {
  return q.publishedAt ?? q.createdAt ?? '';
}
