/**
 * Pure parser for Claude's forced `generate_answers` tool output → universal
 * Answer rows, per generative mode. Mirrors deckgen/parseCards but mode-aware:
 * each mode's raw item shape (from answersPrompt) is mapped into the one Answer
 * row `{promptKind, promptValue?, display, accepted[], options?, orderIndex?,
 * bucket?, imagePrompt?}`. Kept pure so malformed responses are unit-tested
 * without AWS. Bad rows are dropped; an empty result throws.
 */
import type { GenMode } from './answersPrompt';
import { MAPPERS, type Base } from './answerMappers';

export interface ParsedAnswer {
  promptKind: 'NONE' | 'TEXT' | 'IMAGE' | 'REGION';
  promptValue?: string;
  display: string;
  accepted: string[];
  options?: string[];
  orderIndex?: number;
  bucket?: string;
  imagePrompt?: string; // PICTURE_BOX: what the worker should draw (not persisted)
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

/** Common prep (validate display, seed it into accepted) then dispatch to the
 * mode's mapper. Low-complexity by design — per-mode logic lives in MAPPERS. */
function toAnswer(mode: GenMode, v: unknown, i: number): ParsedAnswer | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const display = str(o.display);
  if (!display) return null;
  const accepted = strArr(o.accepted);
  const base: Base = {
    display,
    accepted: accepted.includes(display) ? accepted : [display, ...accepted],
  };
  return MAPPERS[mode](o, base, i);
}

/** Extract + validate the forced generate_answers tool input for `mode`. */
export function parseAnswers(mode: GenMode, body: { content?: ContentBlock[] }): ParsedAnswer[] {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'generate_answers');
  if (!block) throw new Error('no generate_answers tool_use block in model response');
  const input = block.input as { answers?: unknown };
  if (!input || !Array.isArray(input.answers)) {
    throw new Error('generate_answers input missing an answers array');
  }
  const answers = input.answers
    .map((v, i) => toAnswer(mode, v, i))
    .filter((a): a is ParsedAnswer => a !== null);
  if (answers.length === 0) throw new Error('generate_answers produced no valid answers');
  return answers;
}
