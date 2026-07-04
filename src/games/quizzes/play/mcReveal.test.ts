import { describe, it, expect } from 'vitest';
import { mcRevealQuestions } from './mcReveal';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, display: string, promptValue: string, options: string[]) =>
  ({ id, display, promptValue, options: JSON.stringify(options) }) as AnswerRecord;

describe('mcRevealQuestions', () => {
  it('projects all questions with their correct answer and found state', () => {
    const answers = [
      mk('a1', 'Paris', 'Capital of France?', ['Paris', 'Berlin', 'Rome']),
      mk('a2', 'Tokyo', 'Capital of Japan?', ['Tokyo', 'Seoul', 'Beijing']),
    ];
    const questions = mcRevealQuestions(answers, new Set(['a1']));
    expect(questions).toHaveLength(2);
    expect(questions[0]).toMatchObject({
      id: 'a1',
      promptValue: 'Capital of France?',
      correctAnswer: 'Paris',
      found: true,
    });
    expect(questions[1]).toMatchObject({
      id: 'a2',
      correctAnswer: 'Tokyo',
      found: false,
    });
  });

  it('orders questions stably by id', () => {
    const answers = [mk('z', 'Z', 'Q?', ['Z']), mk('a', 'A', 'Q?', ['A'])];
    const questions = mcRevealQuestions(answers, new Set());
    expect(questions.map((q) => q.id)).toEqual(['a', 'z']);
  });

  it('falls back to display when promptValue is absent', () => {
    const answers = [{ id: 'x', display: 'Solo', options: JSON.stringify(['Solo']) } as AnswerRecord]; // prettier-ignore
    const questions = mcRevealQuestions(answers, new Set());
    expect(questions[0].promptValue).toBe('Solo');
  });

  it('parses the options array from JSON', () => {
    const answers = [mk('a1', 'Paris', 'Q?', ['Paris', 'Berlin'])];
    const questions = mcRevealQuestions(answers, new Set());
    expect(questions[0].options).toEqual(['Paris', 'Berlin']);
  });
});
