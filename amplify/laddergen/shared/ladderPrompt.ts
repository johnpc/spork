/**
 * Pure builder for the Bedrock (Claude) request that generates a word ladder.
 * Tool-forced structured output: a single `make_ladder` tool so Claude returns
 * the typed {start,target,path,dictionary}. The path is Claude's proposed
 * solution; validateLadder verifies it independently (we never trust the LLM's
 * claim that it's solvable). Kept separate from the network call for testing.
 */
export interface LadderRequest {
  length: number; // word length (3–5 makes good puzzles)
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const TOOL = {
  name: 'make_ladder',
  description: 'Produce a solvable word ladder puzzle.',
  input_schema: {
    type: 'object',
    properties: {
      start: { type: 'string', description: 'the starting word (all lowercase)' },
      target: { type: 'string', description: 'the goal word, same length as start' },
      path: {
        type: 'array',
        items: { type: 'string' },
        description:
          'a valid solution start→target; each step changes exactly one letter to a real word',
      },
      dictionary: {
        type: 'array',
        items: { type: 'string' },
        description:
          'every word in `path` PLUS several plausible alternate real words of the same length (decoys/alternate routes), all lowercase',
      },
    },
    required: ['start', 'target', 'path', 'dictionary'],
  },
} as const;

const STEPS: Record<LadderRequest['difficulty'], string> = {
  EASY: 'about 3–4 steps',
  MEDIUM: 'about 4–5 steps',
  HARD: 'about 5–7 steps',
};

export function buildLadderRequest(req: LadderRequest): string {
  const system = [
    'You create word-ladder puzzles for a word game.',
    `Both words are ${req.length} letters. The solution path should be ${STEPS[req.difficulty]}.`,
    'Every consecutive pair in `path` MUST differ by exactly one letter and every entry MUST be a',
    'common real English word. Double-check each step before answering.',
    'Include the full path in `dictionary`, plus 4–8 extra same-length real words so players have',
    'alternate routes. Call make_ladder exactly once. All words lowercase.',
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
        content: `Make a ${req.difficulty.toLowerCase()} ${req.length}-letter word ladder.`,
      },
    ],
  });
}
