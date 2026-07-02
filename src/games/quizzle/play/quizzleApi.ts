/** Quizzle read paths. Guest-readable (per-call authMode, like the other
 * games). Quizzle is guest-only; best banks live on the device. */
import { dataClient, readAuthMode, type QuizzleRecord } from '../../../lib/dataClient';
import { publishedQuizzles } from './composeQuizzles';

/** One quizzle by id. */
export async function fetchQuizzle(id: string): Promise<QuizzleRecord | null> {
  const { data } = await dataClient.models.Quizzle.get({ id }, { authMode: await readAuthMode() });
  return data;
}

/** All PUBLISHED quizzles for the Quizzle home. */
export async function fetchQuizzles(): Promise<QuizzleRecord[]> {
  const { data } = await dataClient.models.Quizzle.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return publishedQuizzles(data);
}
