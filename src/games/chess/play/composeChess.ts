/** Pure shaping for the ChessAttack list: PUBLISHED puzzles, newest-first
 * (publishedAt then createdAt). Pure/deterministic → unit-tested without the
 * client. */
import type { ChessAttackRecord } from '../../../lib/dataClient';

export function publishedPuzzles(puzzles: ChessAttackRecord[]): ChessAttackRecord[] {
  return puzzles
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(p: ChessAttackRecord): string {
  return p.publishedAt ?? p.createdAt ?? '';
}
