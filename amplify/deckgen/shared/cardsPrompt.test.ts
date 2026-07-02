import { describe, it, expect } from 'vitest';
import { buildCardsRequest } from './cardsPrompt';

describe('buildCardsRequest', () => {
  const body = () =>
    JSON.parse(
      buildCardsRequest({ topic: 'Spanish Phrases', cardCount: 20, frontLanguage: 'es-ES' }),
    );

  it('forces the generate_cards tool', () => {
    const b = body();
    expect(b.tool_choice).toEqual({ type: 'tool', name: 'generate_cards' });
    expect(b.tools[0].name).toBe('generate_cards');
  });

  it('uses the anthropic bedrock envelope (not native structured output)', () => {
    expect(body().anthropic_version).toBe('bedrock-2023-05-31');
  });

  it('puts the count and languages into the system prompt', () => {
    const b = body();
    expect(b.system).toContain('exactly 20');
    expect(b.system).toContain('es-ES');
  });

  it('passes the topic as the user message', () => {
    expect(body().messages[0].content).toContain('Spanish Phrases');
  });

  it('requires front and back in the card schema', () => {
    const schema = body().tools[0].input_schema.properties.cards.items;
    expect(schema.required).toEqual(['front', 'back']);
  });
});
