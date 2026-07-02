import { describe, it, expect } from 'vitest';
import { validateAcrostic } from './validateAcrostic';

const good = {
  title: 'On Trying',
  quote: 'Do or do not, there is no try.',
  author: 'Yoda',
  clues: [
    { clue: 'A feline', answer: 'cat' },
    { clue: 'Frozen water', answer: 'ice' },
    { clue: 'Our home planet', answer: 'earth' },
    { clue: 'The season after winter', answer: 'spring' },
  ],
};

describe('validateAcrostic', () => {
  it('accepts a valid puzzle and normalizes/ trims answers to lowercase', () => {
    const r = validateAcrostic({
      ...good,
      title: '  On Trying  ',
      clues: [{ clue: '  A feline  ', answer: '  CAT ' }, ...good.clues.slice(1)],
    });
    expect(r.ok).toBe(true);
    expect(r.acrostic?.title).toBe('On Trying');
    expect(r.acrostic?.clues[0]).toEqual({ clue: 'A feline', answer: 'cat' });
    expect(r.acrostic?.quote).toBe(good.quote);
    expect(r.acrostic?.author).toBe('Yoda');
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

  it('rejects fewer than 4 clues', () => {
    const r = validateAcrostic({ ...good, clues: good.clues.slice(0, 3) });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/at least 4 clues/);
  });

  it('rejects an empty clue text', () => {
    const clues = [{ clue: '  ', answer: 'cat' }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/clue text empty/);
  });

  it('rejects a non-single-word / non-letters answer', () => {
    const clues = [{ clue: 'x', answer: 'two words' }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/single letters-only word/);
  });

  it('rejects a duplicate answer', () => {
    const clues = [{ clue: 'x', answer: 'cat' }, ...good.clues];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/repeated/);
  });

  it('handles missing fields via nullish fallbacks', () => {
    const r = validateAcrostic({
      title: undefined as unknown as string,
      quote: undefined as unknown as string,
      author: undefined as unknown as string,
      clues: undefined as unknown as [],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/quote empty/);
  });

  it('handles a nullish answer on a clue', () => {
    const clues = [{ clue: 'x', answer: undefined as unknown as string }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/single letters-only word/);
  });

  it('handles a nullish clue text', () => {
    const clues = [{ clue: undefined as unknown as string, answer: 'cat' }, ...good.clues.slice(1)];
    const r = validateAcrostic({ ...good, clues });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/clue text empty/);
  });

  it('handles a nullish title on the success path', () => {
    const r = validateAcrostic({ ...good, title: undefined as unknown as string });
    expect(r.ok).toBe(true);
    expect(r.acrostic?.title).toBe('');
  });
});
