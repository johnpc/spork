/** Pure parser for Claude's forced `make_chess_puzzle` tool output → a
 * ChessCandidate (validated separately by validateChess). Tolerant of
 * malformed content — reuses the play engine's own tolerant position parser. */
import type { ChessCandidate } from './validateChess';
import { parsePosition } from '../../../src/games/chess/play/parseChess';

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

export function parseChessGen(body: { content?: ContentBlock[] }): ChessCandidate {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'make_chess_puzzle');
  if (!block) throw new Error('no make_chess_puzzle tool_use block in model response');
  const o = (block.input ?? {}) as Record<string, unknown>;
  if (typeof o.name !== 'string') throw new Error('make_chess_puzzle missing name');
  const position = parsePosition(JSON.stringify(o.position ?? {}));
  const solution = strArr(o.solution);
  return {
    name: o.name,
    position,
    solution,
    movesToWin: typeof o.movesToWin === 'number' ? o.movesToWin : solution.length,
  };
}
