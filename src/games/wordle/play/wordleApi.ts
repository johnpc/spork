/** Wordle puzzle read paths. Guest-readable (per-call authMode). Wordle is
 * guest-only; best results live on the device (localStorage). */
import { dataClient, readAuthMode } from '../../../lib/dataClient';

export interface WordlePuzzle {
  id: string;
  answer: string;
  wordLength: number;
  maxGuesses: number;
  status: string;
  publishedAt?: string | null;
  puzzleDate?: string | null;
}

/** One Wordle puzzle by id. */
export async function fetchWordle(id: string): Promise<WordlePuzzle | null> {
  const { data } = await dataClient.models.WordlePuzzle.get(
    { id },
    { authMode: await readAuthMode() },
  );
  if (!data) return null;
  return {
    id: data.id,
    answer: data.answer ?? '',
    wordLength: data.wordLength ?? 5,
    maxGuesses: data.maxGuesses ?? 6,
    status: data.status ?? 'DRAFT',
    publishedAt: data.publishedAt,
    puzzleDate: data.puzzleDate,
  };
}

/** All PUBLISHED Wordle puzzles for the home list. */
export async function fetchWordles(): Promise<WordlePuzzle[]> {
  const { data } = await dataClient.models.WordlePuzzle.list({
    limit: 200,
    authMode: await readAuthMode(),
  });
  return data
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => (b.puzzleDate ?? '').localeCompare(a.puzzleDate ?? ''))
    .map((p) => ({
      id: p.id,
      answer: p.answer ?? '',
      wordLength: p.wordLength ?? 5,
      maxGuesses: p.maxGuesses ?? 6,
      status: p.status ?? 'DRAFT',
      publishedAt: p.publishedAt,
      puzzleDate: p.puzzleDate,
    }));
}
