/** Connections read paths. Guest-readable (per-call authMode). */
import { dataClient, readAuthMode, type ConnectionsPuzzleRecord } from '../../../lib/dataClient';
import { publishedConnections } from './composeConnections';

/** One puzzle by id. */
export async function fetchConnections(id: string): Promise<ConnectionsPuzzleRecord | null> {
  const { data } = await dataClient.models.ConnectionsPuzzle.get(
    { id },
    { authMode: await readAuthMode() },
  );
  return data;
}

/** All PUBLISHED puzzles for the Connections home. */
export async function fetchConnectionsList(): Promise<ConnectionsPuzzleRecord[]> {
  const { data } = await dataClient.models.ConnectionsPuzzle.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedConnections(data);
}
