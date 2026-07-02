/**
 * Client wrappers for the deck-gen custom mutations + the GenerationRun read.
 * Editors only — these go through the userPool auth path (group claims in JWT).
 */
import { dataClient, type GenerationRunRecord } from '../../lib/dataClient';

const EDITOR = { authMode: 'userPool' } as const;

export interface GenerateDeckInput {
  topic: string;
  categorySlug: string;
  cardCount: number;
  voiceLanguage: string;
}

/** Kick off AI generation; returns the new run + deck ids immediately. */
export async function generateDeck(
  input: GenerateDeckInput,
): Promise<{ runId: string; deckId: string }> {
  const { data, errors } = await dataClient.mutations.generateDeck(input, EDITOR);
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to start generation.');
  return { runId: data.runId, deckId: data.deckId };
}

/** Regenerate one card's image or audio; returns the new S3 path. */
export async function regenerateCardMedia(
  cardId: string,
  kind: 'image' | 'audio',
): Promise<string> {
  const { data, errors } = await dataClient.mutations.regenerateCardMedia({ cardId, kind }, EDITOR);
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to regenerate media.');
  return data.path;
}

/** Recent generation runs for the admin dashboard, newest first. */
export async function fetchGenerationRuns(): Promise<GenerationRunRecord[]> {
  const { data } = await dataClient.models.GenerationRun.list({ limit: 100, ...EDITOR });
  return [...data].sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
}
