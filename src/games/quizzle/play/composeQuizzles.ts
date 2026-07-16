/** Pure shaping for the Quizzle list: evergreen PUBLISHED quizzles, newest-first
 * (publishedAt then createdAt). Daily-generated quizzles are excluded — they live
 * on /daily/quizzle, keeping this list curated not ever-growing. Pure/
 * deterministic → unit-tested. */
import type { QuizzleRecord } from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

export function publishedQuizzles(quizzles: QuizzleRecord[]): QuizzleRecord[] {
  return quizzles
    .filter((q) => q.status === 'PUBLISHED' && !isDailyPuzzle(q.id))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(q: QuizzleRecord): string {
  return q.publishedAt ?? q.createdAt ?? '';
}
