import { describe, it, expect } from 'vitest';
import { parseCards } from './parseCards';

const toolBlock = (cards: unknown) => ({
  content: [{ type: 'tool_use', name: 'generate_cards', input: { cards } }],
});

describe('parseCards', () => {
  it('extracts valid cards from the forced tool block', () => {
    const out = parseCards(
      toolBlock([
        { front: 'Hola', back: 'Hello', hint: 'greeting', example: '¡Hola!' },
        { front: 'Gracias', back: 'Thank you' },
      ]),
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ front: 'Hola', back: 'Hello', hint: 'greeting' });
    expect(out[1].hint).toBeUndefined();
  });

  it('drops malformed rows but keeps valid ones', () => {
    const out = parseCards(toolBlock([{ front: 'ok', back: 'fine' }, { front: 42 }, null]));
    expect(out.map((c) => c.front)).toEqual(['ok']);
  });

  it('throws when there is no generate_cards block', () => {
    expect(() => parseCards({ content: [{ type: 'text' }] })).toThrow(/no generate_cards/);
  });

  it('throws when cards is not an array', () => {
    expect(() => parseCards(toolBlock('nope'))).toThrow(/missing a cards array/);
  });

  it('throws when every card is invalid', () => {
    expect(() => parseCards(toolBlock([{ front: 1 }, null]))).toThrow(/no valid cards/);
  });
});
