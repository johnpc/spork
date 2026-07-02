/**
 * Pure builder for the Bedrock (Claude) request that generates a deck's cards.
 * Tool-forced structured output: a single `generate_cards` tool + tool_choice,
 * so Claude must return exactly the typed card array (stoop ADR 0006 — native
 * structured outputs are rejected on the InvokeModel bedrock-2023-05-31
 * envelope, so tool-forcing is the proven route). Kept separate from the
 * network call so the prompt + schema are unit-testable without AWS.
 */
export interface GenerateCardsRequest {
  topic: string;
  cardCount: number;
  /** BCP-47 language of the card FRONT (e.g. es-ES); backs are English. */
  frontLanguage: string;
}

const TOOL = {
  name: 'generate_cards',
  description: 'Produce a deck of study flashcards for the given topic.',
  input_schema: {
    type: 'object',
    properties: {
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            front: { type: 'string', description: 'prompt side (term/question)' },
            back: { type: 'string', description: 'answer side (definition/translation)' },
            hint: { type: 'string', description: 'short optional memory aid' },
            example: { type: 'string', description: 'short example sentence using the term' },
          },
          required: ['front', 'back'],
        },
      },
    },
    required: ['cards'],
  },
} as const;

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildCardsRequest(req: GenerateCardsRequest): string {
  const system = [
    'You are an expert flashcard author for a spaced-repetition study app.',
    `Generate exactly ${req.cardCount} high-quality, distinct cards for the topic.`,
    `Card FRONTS are in language "${req.frontLanguage}"; BACKS are the English answer.`,
    'Keep fronts terse; backs clear and correct; hints and examples short and useful.',
    'Order cards from most fundamental to more advanced. Call generate_cards exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Topic: ${req.topic}` }],
  });
}
