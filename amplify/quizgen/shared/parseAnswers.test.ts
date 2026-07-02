import { describe, it, expect } from 'vitest';
import { parseAnswers } from './parseAnswers';
import type { GenMode } from './answersPrompt';

const block = (answers: unknown) => ({
  content: [{ type: 'tool_use', name: 'generate_answers', input: { answers } }],
});

describe('parseAnswers', () => {
  it('CLASSIC → NONE prompt, display seeded into accepted', () => {
    const out = parseAnswers(
      'CLASSIC',
      block([{ display: 'Lincoln', accepted: ['abraham lincoln'] }]),
    );
    expect(out[0]).toMatchObject({ promptKind: 'NONE', display: 'Lincoln' });
    expect(out[0].accepted).toEqual(['Lincoln', 'abraham lincoln']);
  });

  it('MULTIPLE_CHOICE keeps question + options, drops rows where display∉options', () => {
    const out = parseAnswers(
      'MULTIPLE_CHOICE',
      block([
        { question: 'Capital of Japan?', display: 'Tokyo', options: ['Tokyo', 'Osaka', 'Kyoto'] },
        { question: 'bad', display: 'X', options: ['A', 'B'] }, // display not in options → dropped
      ]),
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ promptKind: 'TEXT', promptValue: 'Capital of Japan?' });
    expect(out[0].options).toEqual(['Tokyo', 'Osaka', 'Kyoto']);
  });

  it('ORDER_UP assigns orderIndex from position', () => {
    const out = parseAnswers(
      'ORDER_UP',
      block([{ display: 'A' }, { display: 'B' }, { display: 'C' }]),
    );
    expect(out.map((a) => a.orderIndex)).toEqual([0, 1, 2]);
  });

  it('SORTABLE requires a bucket', () => {
    const out = parseAnswers(
      'SORTABLE',
      block([{ display: 'Carrot', bucket: 'Vegetable' }, { display: 'NoBucket' }]),
    );
    expect(out).toHaveLength(1);
    expect(out[0].bucket).toBe('Vegetable');
  });

  it('PICTURE_BOX → IMAGE prompt with an imagePrompt (falls back to display)', () => {
    const out = parseAnswers(
      'PICTURE_BOX',
      block([
        { display: 'LeBron James' },
        { display: 'Curry', imagePrompt: 'a small guard shooting' },
      ]),
    );
    expect(out[0]).toMatchObject({ promptKind: 'IMAGE', imagePrompt: 'LeBron James' });
    expect(out[1].imagePrompt).toBe('a small guard shooting');
  });

  it('SLIDESHOW / PICTURE_CLICK require a prompt', () => {
    for (const m of ['SLIDESHOW', 'PICTURE_CLICK'] as GenMode[]) {
      const out = parseAnswers(
        m,
        block([{ prompt: 'clue', display: 'ans' }, { display: 'noPrompt' }]),
      );
      expect(out).toHaveLength(1);
      expect(out[0].promptValue).toBe('clue');
    }
  });

  it('throws on a missing tool block or empty result', () => {
    expect(() => parseAnswers('CLASSIC', { content: [{ type: 'text' }] })).toThrow(
      /no generate_answers/,
    );
    expect(() => parseAnswers('CLASSIC', block([{ nope: 1 }]))).toThrow(/no valid answers/);
  });
});
