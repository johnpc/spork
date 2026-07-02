import { describe, it, expect } from 'vitest';
import { publishedPuzzles } from './composeChess';
import type { ChessAttackRecord } from '../../../lib/dataClient';

const rec = (over: Partial<ChessAttackRecord>): ChessAttackRecord =>
  ({ id: 'x', status: 'PUBLISHED', ...over }) as ChessAttackRecord;

describe('publishedPuzzles', () => {
  it('keeps only PUBLISHED puzzles', () => {
    const out = publishedPuzzles([
      rec({ id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' }),
      rec({ id: 'b', status: 'DRAFT' }),
    ]);
    expect(out.map((p) => p.id)).toEqual(['a']);
  });

  it('sorts newest-first by publishedAt then createdAt', () => {
    const out = publishedPuzzles([
      rec({ id: 'old', publishedAt: '2026-01-01' }),
      rec({ id: 'new', publishedAt: '2026-06-01' }),
      rec({ id: 'created', publishedAt: null, createdAt: '2026-03-01' }),
    ]);
    expect(out.map((p) => p.id)).toEqual(['new', 'created', 'old']);
  });

  it('treats a puzzle with no timestamps as oldest', () => {
    const out = publishedPuzzles([
      rec({ id: 'none', publishedAt: null }),
      rec({ id: 'dated', publishedAt: '2026-01-01' }),
    ]);
    expect(out.map((p) => p.id)).toEqual(['dated', 'none']);
  });
});
