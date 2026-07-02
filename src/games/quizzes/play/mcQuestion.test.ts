import { describe, it, expect } from 'vitest';
import { parseOptions, currentQuestion, isCorrectOption } from './mcQuestion';
import type { AnswerRecord } from '../../../lib/dataClient';

const answer = (id: string, display: string): AnswerRecord =>
  ({ id, display, options: JSON.stringify([display, 'x', 'y']) }) as AnswerRecord;

describe('parseOptions', () => {
  it('parses a valid JSON string[]', () => {
    expect(parseOptions('["a","b"]')).toEqual(['a', 'b']);
  });

  it('returns [] for null/undefined/empty', () => {
    expect(parseOptions(null)).toEqual([]);
    expect(parseOptions(undefined)).toEqual([]);
    expect(parseOptions('')).toEqual([]);
  });

  it('returns [] for malformed JSON', () => {
    expect(parseOptions('{not json')).toEqual([]);
  });

  it('returns [] when JSON is not an array', () => {
    expect(parseOptions('{"a":1}')).toEqual([]);
  });

  it('drops non-string entries', () => {
    expect(parseOptions('["a",1,null,"b"]')).toEqual(['a', 'b']);
  });
});

describe('currentQuestion', () => {
  const answers = [answer('a1', 'One'), answer('a2', 'Two'), answer('a3', 'Three')];

  it('returns the first answer not yet in found', () => {
    expect(currentQuestion(answers, new Set(['a1']))?.id).toBe('a2');
  });

  it('returns the first answer when none are found', () => {
    expect(currentQuestion(answers, new Set())?.id).toBe('a1');
  });

  it('returns null when all answers are found', () => {
    expect(currentQuestion(answers, new Set(['a1', 'a2', 'a3']))).toBeNull();
  });
});

describe('isCorrectOption', () => {
  it('is true only when the option equals the answer display', () => {
    const a = answer('a1', 'One');
    expect(isCorrectOption(a, 'One')).toBe(true);
    expect(isCorrectOption(a, 'x')).toBe(false);
  });
});
