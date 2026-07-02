/**
 * Pure builder for the Bedrock (Claude) request that generates a ChessAttack
 * capture puzzle. Tool-forced structured output: a single `make_chess_puzzle`
 * tool so Claude returns the typed {name, position, solution, movesToWin}.
 * The solution is Claude's proposed line; validateChess verifies it
 * independently (we NEVER trust the LLM's claim that it's solvable). Kept
 * separate from the network call so it's unit-tested without AWS.
 */
export interface ChessRequest {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const TOOL = {
  name: 'make_chess_puzzle',
  description: 'Produce a solvable ChessAttack capture puzzle on a 5x5 board.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'short catchy puzzle title' },
      position: {
        type: 'object',
        description: 'the starting board',
        properties: {
          size: { type: 'number', description: 'always 5' },
          pieces: {
            type: 'array',
            description: '2–4 pieces, each on a distinct square within the 5x5 board',
            items: {
              type: 'object',
              properties: {
                sq: { type: 'string', description: 'square like "a1" (files a–e, ranks 1–5)' },
                piece: { type: 'string', description: 'one of R,N,B,Q,K,P' },
                side: { type: 'string', description: '"w" or "b"' },
              },
              required: ['sq', 'piece', 'side'],
            },
          },
          toMove: { type: 'string', description: 'side to move first, "w" or "b"' },
          goal: { type: 'string', description: 'human-readable objective' },
        },
        required: ['size', 'pieces', 'toMove', 'goal'],
      },
      solution: {
        type: 'array',
        items: { type: 'string' },
        description:
          'coordinate moves like "a1a5" that legally reach a capture of the opposing king; the LAST move must land on the enemy king\'s square',
      },
      movesToWin: { type: 'number', description: 'number of moves in the solution' },
    },
    required: ['name', 'position', 'solution', 'movesToWin'],
  },
} as const;

const MOVES: Record<ChessRequest['difficulty'], string> = {
  EASY: 'exactly 1 move',
  MEDIUM: 'exactly 2 moves',
  HARD: 'exactly 3 moves',
};

export function buildChessRequest(req: ChessRequest): string {
  const system = [
    'You design tiny chess "attack" puzzles on a 5x5 board (files a–e, ranks 1–5).',
    `The side to move must capture the OPPOSING king in ${MOVES[req.difficulty]}.`,
    'Use only 2–4 pieces. Every solution move must be a LEGAL chess move for that piece',
    '(rook/queen/bishop slide only over empty squares; knights jump; pawns as normal),',
    "and the FINAL move must land on the enemy king's square, capturing it.",
    'Double-check each move against the board before answering. Call make_chess_puzzle',
    'exactly once. Squares lowercase file + rank (e.g. "c3"); moves are from+to (e.g. "c3c5").',
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
        content: `Make a ${req.difficulty.toLowerCase()} ChessAttack puzzle (${MOVES[req.difficulty]}).`,
      },
    ],
  });
}
