/** Pure parsers for a ChessAttack row's JSON fields (position + solution).
 * Tolerant of malformed JSON — degrade to a safe empty value rather than throw,
 * so a bad row can't crash the play screen. */
import type { Piece, Position, Side } from './chess';

const SIDES: ReadonlySet<string> = new Set(['w', 'b']);

function toPiece(v: unknown): Piece | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.sq !== 'string' || typeof o.piece !== 'string') return null;
  if (typeof o.side !== 'string' || !SIDES.has(o.side)) return null;
  return { sq: o.sq, piece: o.piece, side: o.side as Side };
}

/** Parse the position JSON into a Position; malformed → empty board. */
export function parsePosition(json: string | null | undefined): Position {
  const empty: Position = { size: 5, pieces: [], toMove: 'w', goal: '' };
  if (!json) return empty;
  try {
    const v: unknown = JSON.parse(json);
    if (!v || typeof v !== 'object') return empty;
    const o = v as Record<string, unknown>;
    const pieces = Array.isArray(o.pieces)
      ? o.pieces.map(toPiece).filter((p): p is Piece => p !== null)
      : [];
    return {
      size: typeof o.size === 'number' ? o.size : 5,
      pieces,
      toMove: o.toMove === 'b' ? 'b' : 'w',
      goal: typeof o.goal === 'string' ? o.goal : '',
    };
  } catch {
    return empty;
  }
}

/** Parse the solution JSON (string[] of coordinate moves); malformed → []. */
export function parseSolution(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}
