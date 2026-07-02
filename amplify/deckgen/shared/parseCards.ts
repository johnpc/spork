/**
 * Pure parser for Claude's InvokeModel response → generated cards. With
 * tool_choice forcing `generate_cards`, the response `content` carries a single
 * `tool_use` block whose `input` is `{ cards: [...] }`. Kept pure so malformed
 * responses are unit-tested without AWS.
 */
export interface GeneratedCard {
  front: string;
  back: string;
  hint?: string;
  example?: string;
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}
interface ClaudeBody {
  content?: ContentBlock[];
}

function toCard(v: unknown): GeneratedCard | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.front !== 'string' || typeof o.back !== 'string') return null;
  return {
    front: o.front,
    back: o.back,
    hint: typeof o.hint === 'string' ? o.hint : undefined,
    example: typeof o.example === 'string' ? o.example : undefined,
  };
}

/** Extract + validate the forced generate_cards tool input. Drops bad rows. */
export function parseCards(body: ClaudeBody): GeneratedCard[] {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'generate_cards');
  if (!block) throw new Error('no generate_cards tool_use block in model response');
  const input = block.input as { cards?: unknown };
  if (!input || !Array.isArray(input.cards)) {
    throw new Error('generate_cards input missing a cards array');
  }
  const cards = input.cards.map(toCard).filter((c): c is GeneratedCard => c !== null);
  if (cards.length === 0) throw new Error('generate_cards produced no valid cards');
  return cards;
}
