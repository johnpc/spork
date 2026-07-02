/**
 * Pure builder for a multiple-choice question. Given the current card, the full
 * deck, and the study direction, returns the answer text plus up to 3 distractor
 * options drawn from OTHER cards' answer face — all shuffled. `shuffle` is
 * injected so tests are deterministic. The answer face follows the direction:
 * direction 'front' → prompt is front, so the answer/options are backs.
 */
import type { CardRecord } from '../../lib/dataClient';

export interface Choices {
  /** The correct option text. */
  answer: string;
  /** All options (answer + distractors), shuffled. */
  options: string[];
}

const MAX_OPTIONS = 4;

/** Default shuffle: Fisher–Yates using Math.random (overridden in tests). */
function defaultShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildChoices(
  card: CardRecord,
  deck: CardRecord[],
  direction: 'front' | 'back',
  shuffle: <T>(a: T[]) => T[] = defaultShuffle,
): Choices {
  const faceOf = (c: CardRecord) => (direction === 'front' ? c.back : c.front);
  const answer = faceOf(card);
  // Distinct distractors from other cards' answer face (dedupe + drop the answer).
  const pool = [...new Set(deck.filter((c) => c.id !== card.id).map(faceOf))].filter(
    (t) => t !== answer,
  );
  const distractors = shuffle(pool).slice(0, MAX_OPTIONS - 1);
  return { answer, options: shuffle([answer, ...distractors]) };
}
