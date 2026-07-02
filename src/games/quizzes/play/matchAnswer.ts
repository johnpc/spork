/**
 * Match a typed guess against the alias index. Pure O(1) lookup: normalize the
 * guess, return the answer id if any accepted spelling matches, else null. The
 * already-found guard lives in the play hook (it owns the found set), keeping
 * this a stateless lookup that's trivial to test.
 */
import { normalize } from './normalize';

export function matchAnswer(guess: string, index: Map<string, string>): string | null {
  return index.get(normalize(guess)) ?? null;
}
