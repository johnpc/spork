import { describe, it, expect } from 'vitest';
import { publishedQuizzes } from './composeQuizzes';
import type { QuizRecord } from '../../../lib/dataClient';

const quiz = (over: Partial<QuizRecord>): QuizRecord =>
  ({ id: 'q', status: 'PUBLISHED', ...over }) as QuizRecord;

describe('publishedQuizzes', () => {
  it('drops non-published quizzes', () => {
    const out = publishedQuizzes([
      quiz({ id: 'a', status: 'PUBLISHED' }),
      quiz({ id: 'b', status: 'DRAFT' }),
      quiz({ id: 'c', status: 'ARCHIVED' }),
    ]);
    expect(out.map((q) => q.id)).toEqual(['a']);
  });

  it('sorts newest-first by publishedAt, then createdAt', () => {
    const out = publishedQuizzes([
      quiz({ id: 'old', publishedAt: '2026-01-01T00:00:00Z' }),
      quiz({ id: 'new', publishedAt: '2026-06-01T00:00:00Z' }),
      quiz({ id: 'created', publishedAt: null, createdAt: '2026-07-01T00:00:00Z' }),
    ]);
    expect(out.map((q) => q.id)).toEqual(['created', 'new', 'old']);
  });
});
