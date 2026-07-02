/** Acrostic read paths. Guest-readable (per-call authMode, like quizzes). The
 * Acrostic game is guest-only — no per-user state. Mirrors ladderApi. */
import { dataClient, readAuthMode, type AcrosticRecord } from '../../../lib/dataClient';
import { publishedAcrostics } from './composeAcrostics';

/** One acrostic by id. */
export async function fetchAcrostic(id: string): Promise<AcrosticRecord | null> {
  const { data } = await dataClient.models.Acrostic.get({ id }, { authMode: await readAuthMode() });
  return data;
}

/** All PUBLISHED acrostics for the Acrostic home. */
export async function fetchAcrostics(): Promise<AcrosticRecord[]> {
  const { data } = await dataClient.models.Acrostic.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedAcrostics(data);
}
