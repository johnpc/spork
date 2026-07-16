/** Pure shaping for the Acrostic list: evergreen PUBLISHED puzzles, newest-first
 * (publishedAt then createdAt). Daily-generated puzzles are excluded — they live
 * on /daily/acrostic, keeping this list curated not ever-growing. Pure/
 * deterministic → unit-tested. Mirrors composeLadders. */
import type { AcrosticRecord } from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

export function publishedAcrostics(acrostics: AcrosticRecord[]): AcrosticRecord[] {
  return acrostics
    .filter((a) => a.status === 'PUBLISHED' && !isDailyPuzzle(a.id))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(a: AcrosticRecord): string {
  return a.publishedAt ?? a.createdAt ?? '';
}
