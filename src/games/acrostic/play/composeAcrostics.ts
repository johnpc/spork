/** Pure shaping for the Acrostic list: PUBLISHED puzzles, newest-first
 * (publishedAt then createdAt). Pure/deterministic → unit-tested without the
 * client. Mirrors composeLadders. */
import type { AcrosticRecord } from '../../../lib/dataClient';

export function publishedAcrostics(acrostics: AcrosticRecord[]): AcrosticRecord[] {
  return acrostics
    .filter((a) => a.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(a: AcrosticRecord): string {
  return a.publishedAt ?? a.createdAt ?? '';
}
