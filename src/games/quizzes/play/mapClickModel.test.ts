import { describe, it, expect } from 'vitest';
import { currentTarget, mapPrompt, resolveClick, isTargetHit } from './mapClickModel';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, over: Partial<AnswerRecord> = {}): AnswerRecord =>
  ({
    id,
    promptKind: 'REGION',
    promptValue: id,
    display: id.toUpperCase(),
    ...over,
  }) as AnswerRecord;

const answers = [mk('a'), mk('b'), mk('c')];

describe('currentTarget', () => {
  it('is the first REGION answer not yet found', () => {
    expect(currentTarget(answers, new Set())?.id).toBe('a');
    expect(currentTarget(answers, new Set(['a']))?.id).toBe('b');
  });
  it('is null once all found', () => {
    expect(currentTarget(answers, new Set(['a', 'b', 'c']))).toBeNull();
  });
});

describe('mapPrompt', () => {
  it('asks to find the target by display', () => {
    expect(mapPrompt(mk('a', { display: 'Nigeria' }))).toBe('Find Nigeria');
  });
  it('celebrates when done', () => {
    expect(mapPrompt(null)).toBe('You found them all!');
  });
});

describe('resolveClick', () => {
  const map = new Map([['566', 'a']]);
  it('resolves a known region id to its answer id', () => {
    expect(resolveClick('566', map)).toBe('a');
    expect(resolveClick(566, map)).toBe('a');
  });
  it('returns null for a country not in the quiz', () => {
    expect(resolveClick('999', map)).toBeNull();
    expect(resolveClick(undefined, map)).toBeNull();
  });
});

describe('isTargetHit', () => {
  const target = mk('a');
  it('is true only when the clicked answer is the current target', () => {
    expect(isTargetHit('a', target)).toBe(true);
    expect(isTargetHit('b', target)).toBe(false);
    expect(isTargetHit(null, target)).toBe(false);
    expect(isTargetHit('a', null)).toBe(false);
  });
});
