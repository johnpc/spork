import { describe, it, expect } from 'vitest';
import { wordLadderRow, acrosticRow, quizzleRow, chessRow } from './islandRows';

const meta = { id: 'x', date: '2026-07-02' };

describe('island row builders', () => {
  it('wordLadderRow: PUBLISHED, date-stamped, JSON-encoded path + dictionary', () => {
    const r = wordLadderRow(
      { start: 'cat', target: 'dog', parPath: ['cat', 'cot', 'dot', 'dog'], dictionary: ['cat'] },
      'EASY',
      meta,
    );
    expect(r).toMatchObject({
      __typename: 'WordLadder',
      start: 'cat',
      target: 'dog',
      status: 'PUBLISHED',
      puzzleDate: '2026-07-02',
    });
    expect(r.parPath).toBe(JSON.stringify(['cat', 'cot', 'dot', 'dog']));
  });

  it('acrosticRow: JSON-encoded clues + author', () => {
    const r = acrosticRow(
      { title: 'T', quote: 'Q', author: 'A', clues: [{ clue: 'c', answer: 'a' }] },
      'MEDIUM',
      meta,
    );
    expect(r).toMatchObject({ __typename: 'Acrostic', author: 'A', status: 'PUBLISHED' });
    expect(r.clues).toBe(JSON.stringify([{ clue: 'c', answer: 'a' }]));
  });

  it('quizzleRow: JSON questions + starting bank', () => {
    const r = quizzleRow({ topic: 'Geo', questions: [{ q: 1 }] }, 1000, meta);
    expect(r).toMatchObject({ __typename: 'Quizzle', topic: 'Geo', startingBank: 1000 });
    expect(r.questions).toBe(JSON.stringify([{ q: 1 }]));
  });

  it('chessRow: JSON position + solution + movesToWin', () => {
    const r = chessRow(
      { name: 'Mate', position: { size: 5, pieces: [] }, solution: ['a1a2'], movesToWin: 1 },
      'HARD',
      meta,
    );
    expect(r).toMatchObject({ __typename: 'ChessAttack', name: 'Mate', movesToWin: 1 });
    expect(r.position).toBe(JSON.stringify({ size: 5, pieces: [] }));
    expect(r.solution).toBe(JSON.stringify(['a1a2']));
  });
});
