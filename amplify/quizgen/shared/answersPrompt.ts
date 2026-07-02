/**
 * Pure builder for the Bedrock (Claude) request that generates a quiz's answers.
 * Tool-forced structured output (stoop ADR 0006): a single `generate_answers`
 * tool + tool_choice, so Claude must return exactly the typed answer array. The
 * tool's item schema is MODE-AWARE (see answerModeSchemas) — each generative
 * mode needs different fields — but all map into the universal Answer row
 * downstream. Kept separate from the network call so it's unit-testable sans AWS.
 */
import { ITEM_PROPS, MODE_HINT } from './answerModeSchemas';

export type GenMode =
  | 'CLASSIC'
  | 'MULTIPLE_CHOICE'
  | 'SLIDESHOW'
  | 'SORTABLE'
  | 'ORDER_UP'
  | 'PICTURE_BOX'
  | 'PICTURE_CLICK';

export interface GenerateAnswersRequest {
  mode: GenMode;
  topic: string;
  answerCount: number;
}

const TOOL = (mode: GenMode) => ({
  name: 'generate_answers',
  description: 'Produce the answers for a quiz of the given topic.',
  input_schema: {
    type: 'object',
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: ITEM_PROPS[mode],
          required: Object.keys(ITEM_PROPS[mode]).filter((k) => k !== 'accepted'),
        },
      },
    },
    required: ['answers'],
  },
});

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildAnswersRequest(req: GenerateAnswersRequest): string {
  const tool = TOOL(req.mode);
  const system = [
    'You are an expert quiz author for a Sporcle-style trivia app.',
    `Generate exactly ${req.answerCount} high-quality, distinct, factually-correct answers.`,
    MODE_HINT[req.mode],
    'Keep answers concise; include common alternate spellings in `accepted` when relevant.',
    'Call generate_answers exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    system,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [{ role: 'user', content: `Topic: ${req.topic}` }],
  });
}
