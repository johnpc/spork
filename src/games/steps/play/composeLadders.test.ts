import { describe, it, expect } from 'vitest';
import { publishedLadders } from './composeLadders';
import type { WordLadderRecord } from '../../../lib/dataClient';

const ladder = (over: Partial<WordLadderRecord>): WordLadderRecord =>
  ({ id: 'l', status: 'PUBLISHED', ...over }) as WordLadderRecord;

describe('publishedLadders', () => {
  it('drops non-published', () => {
    const out = publishedLadders([
      ladder({ id: 'a', status: 'PUBLISHED' }),
      ladder({ id: 'b', status: 'DRAFT' }),
    ]);
    expect(out.map((l) => l.id)).toEqual(['a']);
  });
  it('sorts newest-first by publishedAt then createdAt', () => {
    const out = publishedLadders([
      ladder({ id: 'old', publishedAt: '2026-01-01T00:00:00Z' }),
      ladder({ id: 'new', publishedAt: '2026-06-01T00:00:00Z' }),
    ]);
    expect(out.map((l) => l.id)).toEqual(['new', 'old']);
  });
});
