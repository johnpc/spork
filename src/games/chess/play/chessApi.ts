/** ChessAttack read paths. Guest-readable (per-call authMode, like the other
 * games). The Chess Attack game is guest-only; nothing is persisted per-user. */
import { dataClient, readAuthMode, type ChessAttackRecord } from '../../../lib/dataClient';
import { publishedPuzzles } from './composeChess';

/** One puzzle by id. */
export async function fetchPuzzle(id: string): Promise<ChessAttackRecord | null> {
  const { data } = await dataClient.models.ChessAttack.get(
    { id },
    { authMode: await readAuthMode() },
  );
  return data;
}

/** All PUBLISHED puzzles for the Chess Attack home. */
export async function fetchPuzzles(): Promise<ChessAttackRecord[]> {
  const { data } = await dataClient.models.ChessAttack.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedPuzzles(data);
}
