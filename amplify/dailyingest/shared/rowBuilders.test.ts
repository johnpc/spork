import { describe, it, expect } from 'vitest';
import { quizRows } from './rowBuilders';
import type { ParsedAnswer } from '../../quizgen/shared/parseAnswers';

const answers: ParsedAnswer[] = [
  { promptKind: 'NONE', display: 'Tokyo', accepted: ['Tokyo', 'tokyo'], orderIndex: 0 },
  { promptKind: 'NONE', display: 'Paris', accepted: ['Paris'], orderIndex: 1 },
];

describe('quizRows', () => {
  it('builds a PUBLISHED, date-stamped Quiz + Answer rows the play engine reads', () => {
    const { quiz, answers: rows } = quizRows('CLASSIC', 'World Capitals', 'general', answers, {
      id: 'q1',
      date: '2026-07-02',
    });
    expect(quiz).toMatchObject({
      id: 'q1',
      __typename: 'Quiz',
      mode: 'CLASSIC',
      inputMode: 'TYPE',
      scoringMode: 'MEMBERSHIP',
      status: 'PUBLISHED',
      answerCount: 2,
      puzzleDate: '2026-07-02',
      topic: 'World Capitals',
    });
    expect(quiz.publishedAt).toBe('2026-07-02T12:00:00.000Z');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: 'q1#0', quizId: 'q1', ord: 0, display: 'Tokyo' });
    expect(rows[0].accepted).toBe(JSON.stringify(['Tokyo', 'tokyo']));
  });

  it('derives the axes from the mode (ORDER_UP → ARRANGE/SEQUENCE)', () => {
    const { quiz } = quizRows('ORDER_UP', 'Timeline', 'history', answers, {
      id: 'q2',
      date: '2026-07-02',
    });
    expect(quiz).toMatchObject({ inputMode: 'ARRANGE', scoringMode: 'SEQUENCE' });
  });
});
