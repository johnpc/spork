import { describe, it, expect } from 'vitest';
import { bucketsOf, unsortedItems } from './sortableModel';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, bucket?: string): AnswerRecord =>
  ({ id, display: id, bucket }) as AnswerRecord;

describe('bucketsOf', () => {
  it('returns distinct buckets in first-seen order', () => {
    const answers = [mk('a', 'Fruit'), mk('b', 'Vegetable'), mk('c', 'Fruit')];
    expect(bucketsOf(answers)).toEqual(['Fruit', 'Vegetable']);
  });

  it('ignores blank and missing buckets', () => {
    const answers = [mk('a', '  '), mk('b'), mk('c', 'Fruit')];
    expect(bucketsOf(answers)).toEqual(['Fruit']);
  });

  it('trims whitespace when deduping', () => {
    const answers = [mk('a', ' Fruit '), mk('b', 'Fruit')];
    expect(bucketsOf(answers)).toEqual(['Fruit']);
  });
});

describe('unsortedItems', () => {
  it('excludes ids already in the found set', () => {
    const answers = [mk('a', 'Fruit'), mk('b', 'Fruit')];
    const remaining = unsortedItems(answers, new Set(['a']));
    expect(remaining.map((r) => r.id)).toEqual(['b']);
  });

  it('returns all items when nothing is found', () => {
    const answers = [mk('a', 'Fruit'), mk('b', 'Fruit')];
    expect(unsortedItems(answers, new Set())).toHaveLength(2);
  });
});
