/**
 * Pure DynamoDB row builders for the standalone game islands (Steps, Acrostic,
 * Quizzle, Chess). Each returns a fully-formed PUBLISHED item stamped with
 * `puzzleDate`, matching amplify/seed's row shapes exactly so the play engines
 * parse them. Split from rowBuilders (quiz rows) to keep each file focused.
 */
export interface RowMeta {
  id: string;
  date: string; // YYYY-MM-DD (puzzleDate)
}

const stamp = (date: string) => `${date}T12:00:00.000Z`;

export function wordLadderRow(
  l: { start: string; target: string; parPath: string[]; dictionary: string[] },
  difficulty: string,
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'WordLadder',
    createdAt: now,
    updatedAt: now,
    start: l.start,
    target: l.target,
    difficulty,
    dictionary: JSON.stringify(l.dictionary),
    parPath: JSON.stringify(l.parPath),
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}

export function acrosticRow(
  a: { title: string; quote: string; author: string; clues: { clue: string; answer: string }[] },
  difficulty: string,
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'Acrostic',
    createdAt: now,
    updatedAt: now,
    title: a.title,
    quote: a.quote,
    author: a.author,
    clues: JSON.stringify(a.clues),
    difficulty,
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}

export function quizzleRow(
  q: { topic: string; questions: unknown[] },
  startingBank: number,
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'Quizzle',
    createdAt: now,
    updatedAt: now,
    topic: q.topic,
    questions: JSON.stringify(q.questions),
    startingBank,
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}

export function chessRow(
  p: { name: string; position: unknown; solution: string[]; movesToWin: number },
  difficulty: string,
  meta: RowMeta,
): Record<string, unknown> {
  const now = stamp(meta.date);
  return {
    id: meta.id,
    __typename: 'ChessAttack',
    createdAt: now,
    updatedAt: now,
    name: p.name,
    position: JSON.stringify(p.position),
    solution: JSON.stringify(p.solution),
    movesToWin: p.movesToWin,
    difficulty,
    status: 'PUBLISHED',
    publishedAt: now,
    puzzleDate: meta.date,
  };
}
