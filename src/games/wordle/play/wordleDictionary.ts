/**
 * Client-side Wordle guess validation dictionary. Imports the generated fixture
 * of all valid 5-letter English words. This bundles into the client (~50KB gzipped).
 */
import { validWordleGuesses } from '../../../../amplify/seed/fixtures/wordleGuessList';

const VALID_GUESSES = new Set(validWordleGuesses);

/** Is this word a valid Wordle guess? (Case-insensitive, 5 letters, in dictionary). */
export function isValidWord(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}
