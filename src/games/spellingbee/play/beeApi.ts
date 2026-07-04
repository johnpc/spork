/** Spelling Bee read paths. Guest-readable, PUBLISHED only. */
import { dataClient, readAuthMode, type SpellingBeePuzzleRecord } from '../../../lib/dataClient';

/** One puzzle by id. */
export async function fetchBee(id: string): Promise<SpellingBeePuzzleRecord | null> {
  const { data } = await dataClient.models.SpellingBeePuzzle.get(
    { id },
    { authMode: await readAuthMode() },
  );
  return data;
}

/** All PUBLISHED puzzles for the Bee home, newest-first by puzzleDate (the unique
 * per-day key — publishedAt is identical across a seed batch, so it can't order). */
export async function fetchBees(): Promise<SpellingBeePuzzleRecord[]> {
  const { data } = await dataClient.models.SpellingBeePuzzle.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return data
    .filter((b) => b.status === 'PUBLISHED')
    .sort((a, b) => (b.puzzleDate ?? '').localeCompare(a.puzzleDate ?? ''));
}
