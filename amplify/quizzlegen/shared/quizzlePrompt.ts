/**
 * Pure builder for the Bedrock (Claude) request that generates a Quizzle wager
 * quiz. Tool-forced structured output: a single `make_quizzle` tool so Claude
 * returns the typed {topic, questions:[{question,answer,accepted}]}. The output
 * is Claude's proposed quiz; validateQuizzle verifies it independently (we never
 * trust the LLM). Kept separate from the network call for testing.
 */
export interface QuizzleRequest {
  topic: string;
}

const TOOL = {
  name: 'make_quizzle',
  description: 'Produce a wager trivia quiz on a topic.',
  input_schema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'the quiz topic, echoed back' },
      questions: {
        type: 'array',
        description: 'at least 4 trivia questions',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'the question text' },
            answer: { type: 'string', description: 'the canonical answer (keep natural case)' },
            accepted: {
              type: 'array',
              items: { type: 'string' },
              description: 'alternate accepted spellings/abbreviations (may be empty)',
            },
          },
          required: ['question', 'answer', 'accepted'],
        },
      },
    },
    required: ['topic', 'questions'],
  },
} as const;

export function buildQuizzleRequest(req: QuizzleRequest): string {
  const system = [
    'You create wager trivia quizzes for a game where players bet a bank on each question.',
    `The topic is "${req.topic}". Write at least 4 clear, factual questions with short answers.`,
    'Each answer MUST be a real, verifiable fact — double-check before answering.',
    'Keep the `answer` in natural display case; put lenient alternates (abbreviations, spellings)',
    'in `accepted` (use an empty array when none). Call make_quizzle exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Make a wager trivia quiz about ${req.topic}.` }],
  });
}
