/**
 * Pure builder for the Bedrock (Claude) request that generates a Connections
 * puzzle. Tool-forced structured output: a single `generate_connections` tool
 * so Claude returns typed {groups:[{theme,words,level}]}.
 */
export interface ConnectionsRequest {
  topic?: string; // optional topic constraint (e.g. "Movies", "Science")
}

const TOOL = {
  name: 'generate_connections',
  description: 'Produce a Connections puzzle with 4 themed groups of 4 words each.',
  input_schema: {
    type: 'object',
    properties: {
      groups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            theme: {
              type: 'string',
              description: 'the hidden theme connecting the 4 words',
            },
            words: {
              type: 'array',
              items: { type: 'string' },
              description: 'exactly 4 words that fit the theme',
            },
            level: {
              type: 'number',
              description: 'difficulty: 0=easiest (obvious), 1=medium, 2=tricky, 3=trickiest',
            },
          },
          required: ['theme', 'words', 'level'],
        },
        description: 'exactly 4 groups, each with 4 distinct words; all 16 words must be unique',
      },
    },
    required: ['groups'],
  },
} as const;

export function buildConnectionsRequest(req: ConnectionsRequest): string {
  const topicClause = req.topic ? ` about ${req.topic}` : '';
  const system = [
    'You create Connections puzzles for a word game (NYT Connections style).',
    `Produce exactly 4 themed groups of 4 words each${topicClause}.`,
    'Each group has a clear theme; assign level 0–3 (0=most obvious, 3=most obscure).',
    'All 16 words MUST be distinct (no word belongs to two groups).',
    'Use common words or names the average person knows.',
    'Double-check each group for clarity and uniqueness before answering.',
    'Call generate_connections exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Make a Connections puzzle${topicClause}.` }],
  });
}
