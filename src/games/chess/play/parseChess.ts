/** Pure parsers for a ChessAttack row. `position` is now a FEN string and
 * `solution` is a JSON UCI line. Tolerant of malformed input — degrade to a safe
 * empty value rather than throw, so a bad row can't crash the play screen. */
import { safeGame } from './chess';

const START_EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';

/** Return the FEN if it's a valid position, else a safe empty board. */
export function parseFen(fen: string | null | undefined): string {
  if (!fen || !safeGame(fen)) return START_EMPTY;
  return fen;
}

/** Parse the solution JSON (UCI string[]); malformed → []. */
export function parseSolution(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}
