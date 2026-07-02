/** Pure parser for Claude's forced `make_acrostic` tool output → an
 * AcrosticCandidate (validated separately by validateAcrostic). Tolerant of
 * malformed content. */
import type { AcrosticCandidate, AcrosticClue } from './validateAcrostic';

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

const clueArr = (v: unknown): AcrosticClue[] =>
  Array.isArray(v)
    ? v
        .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
        .map((c) => ({ clue: str(c.clue), answer: str(c.answer) }))
    : [];

export function parseAcrosticGen(body: { content?: ContentBlock[] }): AcrosticCandidate {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'make_acrostic');
  if (!block) throw new Error('no make_acrostic tool_use block in model response');
  const o = (block.input ?? {}) as Record<string, unknown>;
  if (typeof o.quote !== 'string' || typeof o.author !== 'string') {
    throw new Error('make_acrostic missing quote/author');
  }
  return {
    title: str(o.title),
    quote: o.quote,
    author: o.author,
    clues: clueArr(o.clues),
  };
}
