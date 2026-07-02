import { describe, it, expect } from 'vitest';
import { parseAcrosticGen } from './parseAcrosticGen';

const block = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'make_acrostic', input }],
});

describe('parseAcrosticGen', () => {
  it('extracts the candidate and threads the secret word through', () => {
    const c = parseAcrosticGen(
      block({
        title: 'On Trying',
        quote: 'Do or do not.',
        author: 'Yoda',
        clues: [{ clue: 'A feline', answer: 'cat' }],
      }),
      'cat',
    );
    expect(c).toEqual({
      word: 'cat',
      title: 'On Trying',
      quote: 'Do or do not.',
      author: 'Yoda',
      clues: [{ clue: 'A feline', answer: 'cat' }],
    });
  });
  it('coerces non-string clue fields and drops non-object entries', () => {
    const c = parseAcrosticGen(
      block({ quote: 'q', author: 'a', clues: [{ clue: 1, answer: null }, 'x', null] }),
      'x',
    );
    expect(c.title).toBe('');
    expect(c.clues).toEqual([{ clue: '', answer: '' }]);
  });
  it('defaults clues to empty when not an array', () => {
    const c = parseAcrosticGen(block({ quote: 'q', author: 'a', clues: 'nope' }), 'x');
    expect(c.clues).toEqual([]);
  });
  it('throws without content, the tool block, or quote/author', () => {
    expect(() => parseAcrosticGen({}, 'x')).toThrow(/no make_acrostic/);
    expect(() => parseAcrosticGen({ content: [{ type: 'text' }] }, 'x')).toThrow(
      /no make_acrostic/,
    );
    expect(() => parseAcrosticGen(block({ clues: [] }), 'x')).toThrow(/missing quote/);
    expect(() =>
      parseAcrosticGen({ content: [{ type: 'tool_use', name: 'make_acrostic' }] }, 'x'),
    ).toThrow(/missing quote/);
  });
});
