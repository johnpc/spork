import { describe, it, expect } from 'vitest';
import { buildAnswerItems } from './buildAnswerItems';
import type { ParsedAnswer } from '../shared/parseAnswers';

const NOW = '2026-07-02T00:00:00.000Z';

describe('buildAnswerItems', () => {
  it('builds ordered Answer rows, JSON-encoding accepted + options', () => {
    const answers: ParsedAnswer[] = [
      { promptKind: 'TEXT', promptValue: 'Q?', display: 'A', accepted: ['A'], options: ['A', 'B'] },
    ];
    const [row] = buildAnswerItems('q1', answers, NOW);
    expect(row).toMatchObject({
      id: 'q1#0',
      __typename: 'Answer',
      quizId: 'q1',
      ord: 0,
      promptKind: 'TEXT',
      promptValue: 'Q?',
    });
    expect(JSON.parse(row.accepted as string)).toEqual(['A']);
    expect(JSON.parse(row.options as string)).toEqual(['A', 'B']);
  });

  it('uses the resolved image key as promptValue for IMAGE answers', () => {
    const answers: ParsedAnswer[] = [
      { promptKind: 'IMAGE', display: 'LeBron', accepted: ['LeBron'], imagePrompt: 'x' },
    ];
    const [row] = buildAnswerItems(
      'q1',
      answers,
      NOW,
      new Map([[0, 'media/quizzes/q1/q1#0.webp']]),
    );
    expect(row.promptValue).toBe('media/quizzes/q1/q1#0.webp');
  });

  it('carries orderIndex + bucket through', () => {
    const answers: ParsedAnswer[] = [
      { promptKind: 'NONE', display: 'Carrot', accepted: ['Carrot'], bucket: 'Veg' },
      { promptKind: 'NONE', display: 'A', accepted: ['A'], orderIndex: 0 },
    ];
    const rows = buildAnswerItems('q1', answers, NOW);
    expect(rows[0].bucket).toBe('Veg');
    expect(rows[1].orderIndex).toBe(0);
  });
});
