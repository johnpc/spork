import { describe, it, expect } from 'vitest';
import { publishedQuizzles } from './composeQuizzles';
import type { QuizzleRecord } from '../../../lib/dataClient';

const rec = (r: Partial<QuizzleRecord>) => r as QuizzleRecord;

describe('publishedQuizzles', () => {
  it('keeps only PUBLISHED, newest-first by publishedAt then createdAt', () => {
    const out = publishedQuizzles([
      rec({ id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' }),
      rec({ id: 'b', status: 'DRAFT', publishedAt: '2026-05-01' }),
      rec({ id: 'c', status: 'PUBLISHED', publishedAt: '2026-03-01' }),
      rec({ id: 'd', status: 'PUBLISHED', createdAt: '2026-02-01' }),
    ]);
    expect(out.map((q) => q.id)).toEqual(['c', 'd', 'a']);
  });
  it('returns empty when none are published', () => {
    expect(publishedQuizzles([rec({ id: 'x', status: 'DRAFT' })])).toEqual([]);
  });
});
