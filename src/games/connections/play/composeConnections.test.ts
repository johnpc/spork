import { describe, it, expect } from 'vitest';
import { publishedConnections } from './composeConnections';
import type { ConnectionsPuzzleRecord } from '../../../lib/dataClient';

describe('publishedConnections', () => {
  const base: Partial<ConnectionsPuzzleRecord> = {
    groups: '[]',
    maxMistakes: 4,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('filters PUBLISHED and sorts newest first (publishedAt)', () => {
    const puzzles: ConnectionsPuzzleRecord[] = [
      {
        ...base,
        id: '1',
        status: 'PUBLISHED',
        publishedAt: '2025-01-05',
      } as ConnectionsPuzzleRecord,
      { ...base, id: '2', status: 'DRAFT', publishedAt: '2025-01-06' } as ConnectionsPuzzleRecord,
      {
        ...base,
        id: '3',
        status: 'PUBLISHED',
        publishedAt: '2025-01-03',
      } as ConnectionsPuzzleRecord,
    ];
    const res = publishedConnections(puzzles);
    expect(res.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('falls back to createdAt when publishedAt absent', () => {
    const puzzles: ConnectionsPuzzleRecord[] = [
      { ...base, id: 'a', status: 'PUBLISHED', createdAt: '2025-01-08' } as ConnectionsPuzzleRecord,
      { ...base, id: 'b', status: 'PUBLISHED', createdAt: '2025-01-02' } as ConnectionsPuzzleRecord,
    ];
    const res = publishedConnections(puzzles);
    expect(res.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('orders by puzzleDate first (the unique per-day key, not the shared publishedAt)', () => {
    const puzzles: ConnectionsPuzzleRecord[] = [
      {
        ...base,
        id: 'old',
        status: 'PUBLISHED',
        puzzleDate: '2025-01-01',
        publishedAt: '2025-06-01',
      } as ConnectionsPuzzleRecord,
      {
        ...base,
        id: 'new',
        status: 'PUBLISHED',
        puzzleDate: '2025-01-09',
        publishedAt: '2025-06-01',
      } as ConnectionsPuzzleRecord,
    ];
    // Same publishedAt (a seed batch) — puzzleDate decides: newest first.
    expect(publishedConnections(puzzles).map((p) => p.id)).toEqual(['new', 'old']);
  });
});
