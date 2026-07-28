/** Pure shaping for the Connections list: evergreen PUBLISHED puzzles, newest-
 * first by puzzleDate (the unique per-day key — publishedAt is identical across a
 * seed batch, so it can't order them). Daily-generated puzzles are excluded (they
 * live on /daily/connections). Pure/deterministic → unit-tested. */
import type { ConnectionsPuzzleRecord } from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

export function publishedConnections(
  puzzles: ConnectionsPuzzleRecord[],
): ConnectionsPuzzleRecord[] {
  return puzzles
    .filter((p) => p.status === 'PUBLISHED' && !isDailyPuzzle(p.id))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(p: ConnectionsPuzzleRecord): string {
  return p.puzzleDate ?? p.publishedAt ?? p.createdAt ?? '';
}
