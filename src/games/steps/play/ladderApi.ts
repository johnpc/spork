/** Word-ladder read paths. Guest-readable (per-call authMode, like quizzes).
 * The Steps game is guest-only; best results (fewest moves) live on the device. */
import { dataClient, readAuthMode, type WordLadderRecord } from '../../../lib/dataClient';
import { publishedLadders } from './composeLadders';

/** One ladder by id. */
export async function fetchLadder(id: string): Promise<WordLadderRecord | null> {
  const { data } = await dataClient.models.WordLadder.get(
    { id },
    { authMode: await readAuthMode() },
  );
  return data;
}

/** All PUBLISHED ladders for the Steps home. */
export async function fetchLadders(): Promise<WordLadderRecord[]> {
  const { data } = await dataClient.models.WordLadder.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedLadders(data);
}
