/** Pure shaping for the quizzes list: keep only evergreen PUBLISHED quizzes,
 * newest first (by publishedAt, falling back to createdAt). Daily-generated
 * quizzes are excluded — they live on /daily/quiz-*, so this list stays a curated
 * set not an ever-growing wall. Pure + deterministic → unit-tested. */
import type { QuizRecord } from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

export function publishedQuizzes(quizzes: QuizRecord[]): QuizRecord[] {
  return quizzes
    .filter((q) => q.status === 'PUBLISHED' && !isDailyPuzzle(q.id))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(q: QuizRecord): string {
  return q.publishedAt ?? q.createdAt ?? '';
}
