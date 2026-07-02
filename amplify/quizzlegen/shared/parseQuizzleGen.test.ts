import { describe, it, expect } from 'vitest';
import { parseQuizzleGen } from './parseQuizzleGen';

const block = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'make_quizzle', input }],
});

describe('parseQuizzleGen', () => {
  it('extracts the candidate', () => {
    const c = parseQuizzleGen(
      block({
        topic: 'Science',
        questions: [{ question: 'Q1', answer: 'A1', accepted: ['a1'] }],
      }),
    );
    expect(c).toEqual({
      topic: 'Science',
      questions: [{ question: 'Q1', answer: 'A1', accepted: ['a1'] }],
    });
  });

  it('coerces malformed questions to empty strings and drops non-string accepted', () => {
    const c = parseQuizzleGen(
      block({ topic: 'T', questions: [{ answer: 5, accepted: ['ok', 1, null] }, null] }),
    );
    expect(c.questions[0]).toEqual({ question: '', answer: '', accepted: ['ok'] });
    expect(c.questions[1]).toEqual({ question: '', answer: '', accepted: [] });
  });

  it('defaults questions to empty when not an array', () => {
    const c = parseQuizzleGen(block({ topic: 'T', questions: 'nope' }));
    expect(c.questions).toEqual([]);
  });

  it('throws without the tool block or topic', () => {
    expect(() => parseQuizzleGen({ content: [{ type: 'text' }] })).toThrow(/no make_quizzle/);
    expect(() => parseQuizzleGen(block({ questions: [] }))).toThrow(/missing topic/);
  });
});
