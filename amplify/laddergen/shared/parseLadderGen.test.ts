import { describe, it, expect } from 'vitest';
import { parseLadderGen } from './parseLadderGen';

const block = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'make_ladder', input }],
});

describe('parseLadderGen', () => {
  it('extracts the candidate', () => {
    const c = parseLadderGen(
      block({ start: 'cat', target: 'dog', path: ['cat', 'cot', 'dog'], dictionary: ['cat'] }),
    );
    expect(c).toEqual({
      start: 'cat',
      target: 'dog',
      path: ['cat', 'cot', 'dog'],
      dictionary: ['cat'],
    });
  });
  it('drops non-string path/dictionary entries', () => {
    const c = parseLadderGen(
      block({ start: 'a', target: 'b', path: ['a', 1, null], dictionary: 'x' }),
    );
    expect(c.path).toEqual(['a']);
    expect(c.dictionary).toEqual([]);
  });
  it('throws without the tool block or start/target', () => {
    expect(() => parseLadderGen({ content: [{ type: 'text' }] })).toThrow(/no make_ladder/);
    expect(() => parseLadderGen(block({ path: [] }))).toThrow(/missing start/);
  });
});
