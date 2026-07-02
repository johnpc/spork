import { describe, it, expect } from 'vitest';
import { buildCardItem } from './cardItem';

const base = {
  id: 'c1',
  deckId: 'd1',
  ord: 3,
  now: '2026-06-01T00:00:00.000Z',
  card: { front: 'Hola', back: 'Hello', hint: 'greeting', example: '¡Hola!' },
};

describe('buildCardItem', () => {
  it('builds an Amplify-shaped Card item with metadata', () => {
    const item = buildCardItem({ ...base, imagePath: 'img', audioPath: 'aud' });
    expect(item).toMatchObject({
      id: 'c1',
      __typename: 'Card',
      createdAt: base.now,
      updatedAt: base.now,
      deckId: 'd1',
      ord: 3,
      front: 'Hola',
      back: 'Hello',
      hint: 'greeting',
      example: '¡Hola!',
      imagePath: 'img',
      audioPath: 'aud',
    });
  });

  it('leaves media paths undefined when not produced', () => {
    const item = buildCardItem(base);
    expect(item.imagePath).toBeUndefined();
    expect(item.audioPath).toBeUndefined();
  });
});
