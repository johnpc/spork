/** Pure shaping for the Steps list: PUBLISHED ladders, newest-first (publishedAt
 * then createdAt). Pure/deterministic → unit-tested without the client. */
import type { WordLadderRecord } from '../../../lib/dataClient';

export function publishedLadders(ladders: WordLadderRecord[]): WordLadderRecord[] {
  return ladders
    .filter((l) => l.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(l: WordLadderRecord): string {
  return l.publishedAt ?? l.createdAt ?? '';
}
