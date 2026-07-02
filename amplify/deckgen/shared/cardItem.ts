/**
 * Pure builder for a Card DynamoDB item written by the worker. Mirrors the
 * Card model in amplify/data/resource.ts — the app reads these rows, so the
 * shape MUST match what AppSync would write (id, __typename, timestamps set
 * here since a direct PutItem has no resolver to set them).
 */
import type { GeneratedCard } from './parseCards';

export interface CardItemInput {
  id: string;
  deckId: string;
  ord: number;
  now: string;
  card: GeneratedCard;
  imagePath?: string;
  audioPath?: string;
}

/** Build the Amplify-shaped Card item for a direct PutItem. */
export function buildCardItem(input: CardItemInput): Record<string, unknown> {
  const { id, deckId, ord, now, card, imagePath, audioPath } = input;
  return {
    id,
    __typename: 'Card',
    createdAt: now,
    updatedAt: now,
    deckId,
    ord,
    front: card.front,
    back: card.back,
    hint: card.hint,
    example: card.example,
    imagePath: imagePath ?? undefined,
    audioPath: audioPath ?? undefined,
  };
}
