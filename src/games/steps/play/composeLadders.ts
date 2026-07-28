/** Pure shaping for the Steps list: evergreen PUBLISHED ladders, newest-first
 * (publishedAt then createdAt). Daily-generated ladders are excluded — they live
 * on the /daily/steps browse surface, so the home list stays a curated set rather
 * than an ever-growing wall of past days. Pure/deterministic → unit-tested. */
import type { WordLadderRecord } from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

export function publishedLadders(ladders: WordLadderRecord[]): WordLadderRecord[] {
  return ladders
    .filter((l) => l.status === 'PUBLISHED' && !isDailyPuzzle(l.id))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(l: WordLadderRecord): string {
  return l.publishedAt ?? l.createdAt ?? '';
}
