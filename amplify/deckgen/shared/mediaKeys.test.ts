import { describe, it, expect } from 'vitest';
import { cardImageKey, cardAudioKey, deckCoverKey, imagePrompt, coverPrompt } from './mediaKeys';

describe('mediaKeys', () => {
  it('builds webp image, mp3 audio, and cover keys under the deck prefix', () => {
    expect(cardImageKey('d1', 'c1')).toBe('media/decks/d1/c1.webp');
    expect(cardAudioKey('d1', 'c1')).toBe('media/decks/d1/c1.mp3');
    expect(deckCoverKey('d1')).toBe('media/decks/d1/cover.webp');
  });

  it('builds an image prompt with the front, topic, and a no-text constraint', () => {
    const p = imagePrompt('Hola', 'Spanish Phrases');
    expect(p).toContain('Hola');
    expect(p).toContain('Spanish Phrases');
    expect(p).toMatch(/no text/i);
  });

  it('builds a cover prompt from the topic with a no-text constraint', () => {
    const p = coverPrompt('Greek Gods');
    expect(p).toContain('Greek Gods');
    expect(p).toMatch(/no text/i);
  });
});
