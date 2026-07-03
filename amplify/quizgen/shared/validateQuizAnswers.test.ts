import { describe, it, expect } from 'vitest';
import { validateQuizAnswers } from './validateQuizAnswers';
import type { ParsedAnswer } from './parseAnswers';

const a = (display: string, extra: Partial<ParsedAnswer> = {}): ParsedAnswer => ({
  promptKind: 'NONE',
  display,
  accepted: [display],
  ...extra,
});

const four = [a('One'), a('Two'), a('Three'), a('Four')];

describe('validateQuizAnswers', () => {
  it('accepts a healthy CLASSIC set', () => {
    expect(validateQuizAnswers('CLASSIC', four)).toEqual({ ok: true });
  });

  it('rejects a too-thin set (< 4 answers)', () => {
    expect(validateQuizAnswers('CLASSIC', [a('Only'), a('Two')]).ok).toBe(false);
  });

  it('rejects a blank display', () => {
    const v = validateQuizAnswers('CLASSIC', [a('One'), a('Two'), a('Three'), a('   ')]);
    expect(v).toMatchObject({ ok: false, reason: 'blank display' });
  });

  it('rejects duplicate answers (case-insensitive)', () => {
    const v = validateQuizAnswers('CLASSIC', [a('Tokyo'), a('Paris'), a('Rome'), a('tokyo')]);
    expect(v).toMatchObject({ ok: false, reason: 'duplicate answers' });
  });

  it('MULTIPLE_CHOICE: each question needs ≥2 options including the answer', () => {
    const good = four.map((x) => ({ ...x, options: [x.display, 'Distractor'] }));
    expect(validateQuizAnswers('MULTIPLE_CHOICE', good).ok).toBe(true);
    const noOpts = four.map((x) => ({ ...x, options: [x.display] }));
    expect(validateQuizAnswers('MULTIPLE_CHOICE', noOpts).ok).toBe(false);
    const answerMissing = four.map((x) => ({ ...x, options: ['A', 'B'] }));
    expect(validateQuizAnswers('MULTIPLE_CHOICE', answerMissing)).toMatchObject({
      ok: false,
      reason: 'answer not among its options',
    });
  });

  it('SORTABLE: needs ≥2 distinct buckets', () => {
    const oneBucket = four.map((x) => ({ ...x, bucket: 'Fruit' }));
    expect(validateQuizAnswers('SORTABLE', oneBucket).ok).toBe(false);
    const twoBuckets = [
      a('Apple', { bucket: 'Fruit' }),
      a('Pear', { bucket: 'Fruit' }),
      a('Carrot', { bucket: 'Veg' }),
      a('Pea', { bucket: 'Veg' }),
    ];
    expect(validateQuizAnswers('SORTABLE', twoBuckets).ok).toBe(true);
  });
});
