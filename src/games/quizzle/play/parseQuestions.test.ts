import { describe, it, expect } from 'vitest';
import { parseQuestions } from './parseQuestions';

describe('parseQuestions', () => {
  it('parses well-formed questions with accepted', () => {
    const json = JSON.stringify([{ question: 'Q1', answer: 'A1', accepted: ['a', 'b'] }]);
    expect(parseQuestions(json)).toEqual([{ question: 'Q1', answer: 'A1', accepted: ['a', 'b'] }]);
  });
  it('keeps well-formed entries and drops malformed ones', () => {
    const json = JSON.stringify([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2' },
      { answer: 'A3' },
      42,
      null,
    ]);
    expect(parseQuestions(json)).toEqual([{ question: 'Q1', answer: 'A1', accepted: undefined }]);
  });
  it('drops non-string accepted entries', () => {
    const json = JSON.stringify([{ question: 'Q', answer: 'A', accepted: ['x', 5, null] }]);
    expect(parseQuestions(json)).toEqual([{ question: 'Q', answer: 'A', accepted: ['x'] }]);
  });
  it('returns empty for null, non-array, or bad JSON', () => {
    expect(parseQuestions(null)).toEqual([]);
    expect(parseQuestions(undefined)).toEqual([]);
    expect(parseQuestions('{}')).toEqual([]);
    expect(parseQuestions('not json')).toEqual([]);
  });
});
