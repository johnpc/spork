/** Pure shaping for the Connections list: PUBLISHED puzzles, newest-first by
 * puzzleDate (the unique per-day key — publishedAt is identical across a seed
 * batch, so it can't order them). Pure/deterministic → unit-tested. */
import type { ConnectionsPuzzleRecord } from '../../../lib/dataClient';

export function publishedConnections(
  puzzles: ConnectionsPuzzleRecord[],
): ConnectionsPuzzleRecord[] {
  return puzzles
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => stamp(b).localeCompare(stamp(a)));
}

function stamp(p: ConnectionsPuzzleRecord): string {
  return p.puzzleDate ?? p.publishedAt ?? p.createdAt ?? '';
}
