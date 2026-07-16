/** Spelling Bee read paths. Guest-readable, PUBLISHED only. */
import {
  dataClient,
  readAuthMode,
  unwrap,
  type SpellingBeePuzzleRecord,
} from '../../../lib/dataClient';
import { isDailyPuzzle } from '../../shared/daily/isDailyPuzzle';

/** One puzzle by id. */
export async function fetchBee(id: string): Promise<SpellingBeePuzzleRecord | null> {
  const data = unwrap(
    await dataClient.models.SpellingBeePuzzle.get({ id }, { authMode: await readAuthMode() }),
  );
  return data;
}

/** Evergreen PUBLISHED puzzles for the Bee home, newest-first by puzzleDate (the
 * unique per-day key — publishedAt is identical across a seed batch, so it can't
 * order). Daily-generated puzzles are excluded — they live on /daily/spellingbee,
 * keeping this list curated not ever-growing. */
export async function fetchBees(): Promise<SpellingBeePuzzleRecord[]> {
  const data = unwrap(
    await dataClient.models.SpellingBeePuzzle.list({
      limit: 200,
      authMode: await readAuthMode(),
    }),
  );
  return data
    .filter((b) => b.status === 'PUBLISHED' && !isDailyPuzzle(b.id))
    .sort((a, b) => (b.puzzleDate ?? '').localeCompare(a.puzzleDate ?? ''));
}
