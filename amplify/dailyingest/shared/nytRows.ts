/**
 * Pure DynamoDB row builders for the NYT-style islands (Wordle, Connections,
 * Spelling Bee). Same contract as islandRows: a fully-formed PUBLISHED item
 * stamped with `puzzleDate`, matching amplify/seed's row shapes exactly so the
 * play engines parse them. Split out to keep each file under the line limit.
 */
import type { RowMeta } from './islandRows';

const stamp = (date: string) => `${date}T12:00:00.000Z`;

export function wordleRow(answer: string, meta: RowMeta): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'WordlePuzzle',
    createdAt: now,
    updatedAt: now,
    answer: answer.toLowerCase(),
    wordLength: answer.length,
    maxGuesses: 6,
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}

export function connectionsRow(
  c: { groups: { theme: string; words: string[]; level: number }[] },
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'ConnectionsPuzzle',
    createdAt: now,
    updatedAt: now,
    groups: JSON.stringify(c.groups),
    maxMistakes: 4,
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}

export function spellingBeeRow(
  b: { letters: string; centerLetter: string; answers: string[]; pangrams: string[] },
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'SpellingBeePuzzle',
    createdAt: now,
    updatedAt: now,
    letters: b.letters,
    centerLetter: b.centerLetter,
    answers: JSON.stringify(b.answers),
    pangrams: JSON.stringify(b.pangrams),
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}
