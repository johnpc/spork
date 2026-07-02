/**
 * Pure builder for the Bedrock (Claude) request that generates an Acrostic
 * puzzle. Tool-forced structured output: a single `make_acrostic` tool so Claude
 * returns the typed {title, quote, author, clues}. The clues/answers are
 * Claude's proposal; validateAcrostic verifies them independently (we never
 * trust the LLM's claim that the puzzle is well-formed/solvable). Kept separate
 * from the network call for testing.
 */
export interface AcrosticRequest {
  topic: string; // theme for the quote, e.g. "perseverance"
}

const TOOL = {
  name: 'make_acrostic',
  description: 'Produce a solvable acrostic quote puzzle.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'a short puzzle title' },
      quote: { type: 'string', description: 'a short, real, memorable quote' },
      author: { type: 'string', description: 'who said or wrote the quote' },
      clues: {
        type: 'array',
        description: 'at least 4 clues; each answer a single lowercase letters-only word',
        items: {
          type: 'object',
          properties: {
            clue: { type: 'string', description: 'a general-knowledge clue' },
            answer: { type: 'string', description: 'one lowercase word, letters only' },
          },
          required: ['clue', 'answer'],
        },
      },
    },
    required: ['title', 'quote', 'author', 'clues'],
  },
} as const;

export function buildAcrosticRequest(req: AcrosticRequest): string {
  const system = [
    'You create acrostic quote puzzles for a word game.',
    `The quote should be a real, memorable saying about ${req.topic}, with a named author.`,
    'Provide at least 4 clues; each clue is a simple general-knowledge question whose answer is a',
    'single common English word, all lowercase, letters only (no spaces, digits or punctuation).',
    'Every answer MUST be distinct. Double-check each answer before answering.',
    'Call make_acrostic exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [
      {
        role: 'user',
        content: `Make an acrostic puzzle about ${req.topic}.`,
      },
    ],
  });
}
