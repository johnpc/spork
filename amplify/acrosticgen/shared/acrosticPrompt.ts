/**
 * Pure builder for the Bedrock (Claude) request that generates an Acrostic
 * puzzle. Tool-forced structured output: a single `make_acrostic` tool so Claude
 * returns the typed {title, quote, author, clues}. The clues are ORDERED so the
 * first letters of their answers spell a SECRET WORD (the puzzle theme); the
 * quote is a real saying about that word, shown as the reward on completion.
 * validateAcrostic verifies the acrostic property independently — we never trust
 * the LLM's claim that it's well-formed. Kept separate from the network call.
 */
export interface AcrosticRequest {
  /** The secret word the answers' initials must spell, e.g. "OCEAN". */
  word: string;
}

const TOOL = {
  name: 'make_acrostic',
  description: 'Produce a solvable acrostic whose answer-initials spell the secret word.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'a short puzzle title (do NOT reveal the word)' },
      quote: { type: 'string', description: 'a short real quote about the secret word' },
      author: { type: 'string', description: 'who said or wrote the quote' },
      clues: {
        type: 'array',
        description:
          'one clue per letter of the secret word, IN ORDER; each answer is a single ' +
          'lowercase letters-only word STARTING WITH that letter',
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
  const word = req.word.toUpperCase();
  const letters = word.split('').join(', ');
  const system = [
    'You create acrostic word puzzles for a word game.',
    `The SECRET WORD is "${word}". Provide EXACTLY ${word.length} clues, one per letter.`,
    `Clue i's answer MUST start with letter i of the word, in this order: ${letters}.`,
    'Each answer is a single common English word, all lowercase, letters only',
    '(no spaces, digits or punctuation). Every answer MUST be distinct.',
    `Also give a short, real, memorable quote ABOUT "${word}" with a named author.`,
    'Double-check every answer starts with the right letter. Call make_acrostic exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Make an acrostic puzzle for the word ${word}.` }],
  });
}
