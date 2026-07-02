import { describe, it, expect } from 'vitest';
import { validateAcrostic } from './validateAcrostic';

// answers' initials (o,c,e,a,n) spell the secret word OCEAN.
const good = {
  word: 'ocean',
  title: 'On the Sea',
  quote: 'The sea, once it casts its spell, holds one in its net of wonder forever.',
  author: 'Jacques Cousteau',
  clues: [
    { clue: 'A citrus fruit', answer: 'orange' },
    { clue: 'A baby cow', answer: 'calf' },
    { clue: 'A large grey mammal', answer: 'elephant' },
    { clue: 'Keeps the doctor away', answer: 'apple' },
    { clue: 'Opposite of day', answer: 'night' },
  ],
};

describe('validateAcrostic', () => {
  it('accepts a valid acrostic and normalizes/trims answers to lowercase', () => {
    const r = validateAcrostic({
      ...good,
      title: '  On the Sea  ',
      clues: [{ clue: '  A citrus fruit  ', answer: '  ORANGE ' }, ...good.clues.slice(1)],
    });
    expect(r.ok).toBe(true);
    expect(r.acrostic?.title).toBe('On the Sea');
    expect(r.acrostic?.clues[0]).toEqual({ clue: 'A citrus fruit', answer: 'orange' });
    expect(r.acrostic?.author).toBe('Jacques Cousteau');
  });

  it('rejects a secret word that is not letters-only', () => {
    const r = validateAcrostic({ ...good, word: 'oc3an' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not letters-only/);
  });

  it('rejects an empty quote', () => {
    const r = validateAcrostic({ ...good, quote: '   ' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/quote empty/);
  });

  it('rejects a quote with no letters (numeric/punctuation only)', () => {
    const r = validateAcrostic({ ...good, quote: '123 !!! ...' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no letters/);
  });

  it('rejects a missing author', () => {
    const r = validateAcrostic({ ...good, author: '' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/author missing/);
  });

  it('rejects a clue count that does not match the word length', () => {
    const r = validateAcrostic({ ...good, clues: good.clues.slice(0, 3) });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/exactly 5 clues/);
  });

  it('rejects a clue whose answer does not start with the right letter', () => {
    // Second letter must be "c" (OCEAN); "dog" starts with d.
    const clues = [good.clues[0], { clue: 'x', answer: 'dog' }, ...good.clues.slice(2)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/must start with "c"/);
  });

  it('rejects an empty clue text', () => {
    const clues = [{ clue: '  ', answer: 'orange' }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/clue text empty/);
  });

  it('rejects a non-single-word / non-letters answer', () => {
    const clues = [{ clue: 'x', answer: 'or ange' }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/single letters-only word/);
  });

  it('rejects a duplicate answer', () => {
    // Make a word with a repeated initial so the position check passes but the
    // dedup catches the identical answer: OO → orange, orange.
    const r = validateAcrostic({
      word: 'oo',
      title: 't',
      quote: 'A real saying.',
      author: 'Someone',
      clues: [
        { clue: 'A citrus fruit', answer: 'orange' },
        { clue: 'The same fruit', answer: 'orange' },
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/repeated/);
  });

  it('handles missing fields via nullish fallbacks', () => {
    const r = validateAcrostic({
      word: undefined as unknown as string,
      title: undefined as unknown as string,
      quote: undefined as unknown as string,
      author: undefined as unknown as string,
      clues: undefined as unknown as [],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not letters-only/);
  });

  it('handles a nullish title on the success path', () => {
    const r = validateAcrostic({ ...good, title: undefined as unknown as string });
    expect(r.ok).toBe(true);
    expect(r.acrostic?.title).toBe('');
  });
});
