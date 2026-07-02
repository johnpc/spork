/** Pure shaping for the Quizzle list: PUBLISHED quizzles, newest-first
 * (publishedAt then createdAt). Pure/deterministic → unit-tested without the
 * client. */
import type { QuizzleRecord } from '../../../lib/dataClient';

export function publishedQuizzles(quizzles: QuizzleRecord[]): QuizzleRecord[] {
  return quizzles
    .filter((q) => q.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(q: QuizzleRecord): string {
  return q.publishedAt ?? q.createdAt ?? '';
}
