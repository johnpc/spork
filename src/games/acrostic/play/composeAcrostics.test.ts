import { describe, it, expect } from 'vitest';
import { publishedAcrostics } from './composeAcrostics';
import type { AcrosticRecord } from '../../../lib/dataClient';

const rec = (p: Partial<AcrosticRecord>): AcrosticRecord => p as AcrosticRecord;

describe('publishedAcrostics', () => {
  it('keeps only PUBLISHED, newest-first by publishedAt then createdAt', () => {
    const out = publishedAcrostics([
      rec({ id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' }),
      rec({ id: 'b', status: 'DRAFT', publishedAt: '2026-05-01' }),
      rec({ id: 'c', status: 'PUBLISHED', publishedAt: '2026-03-01' }),
      rec({ id: 'd', status: 'PUBLISHED', createdAt: '2026-02-01' }),
      rec({ id: 'e', status: 'PUBLISHED' }),
    ]);
    expect(out.map((a) => a.id)).toEqual(['c', 'd', 'a', 'e']);
  });

  it('returns empty when nothing is published', () => {
    expect(publishedAcrostics([rec({ id: 'x', status: 'DRAFT' })])).toEqual([]);
  });
});
