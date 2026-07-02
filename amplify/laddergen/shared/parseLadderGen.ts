/** Pure parser for Claude's forced `make_ladder` tool output → a LadderCandidate
 * (validated separately by validateLadder). Tolerant of malformed content. */
import type { LadderCandidate } from './validateLadder';

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

export function parseLadderGen(body: { content?: ContentBlock[] }): LadderCandidate {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'make_ladder');
  if (!block) throw new Error('no make_ladder tool_use block in model response');
  const o = (block.input ?? {}) as Record<string, unknown>;
  if (typeof o.start !== 'string' || typeof o.target !== 'string') {
    throw new Error('make_ladder missing start/target');
  }
  return {
    start: o.start,
    target: o.target,
    path: strArr(o.path),
    dictionary: strArr(o.dictionary),
  };
}
