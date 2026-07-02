/** Pure parser for Claude's forced `make_quizzle` tool output → a
 * QuizzleCandidate (validated separately by validateQuizzle). Tolerant of
 * malformed content — degrade to empty rather than assume shape. */
import type { QuizzleCandidate, QuizzleQuestionCandidate } from './validateQuizzle';

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

function toQuestion(v: unknown): QuizzleQuestionCandidate {
  const o = (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
  return {
    question: typeof o.question === 'string' ? o.question : '',
    answer: typeof o.answer === 'string' ? o.answer : '',
    accepted: strArr(o.accepted),
  };
}

export function parseQuizzleGen(body: { content?: ContentBlock[] }): QuizzleCandidate {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'make_quizzle');
  if (!block) throw new Error('no make_quizzle tool_use block in model response');
  const o = (block.input ?? {}) as Record<string, unknown>;
  if (typeof o.topic !== 'string') throw new Error('make_quizzle missing topic');
  const questions = Array.isArray(o.questions) ? o.questions.map(toQuestion) : [];
  return { topic: o.topic, questions };
}
