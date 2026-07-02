/**
 * Pure validator for a generated acrostic puzzle. An LLM proposes a quote +
 * author + clues; we NEVER trust it — we verify the puzzle is well-formed and
 * solvable: a non-empty quote, a named author, at least 4 clues, and every clue
 * having a non-empty single-word (letters-only) answer with no duplicate
 * answers. Answers are normalized to lowercase. Only valid puzzles become
 * fixtures/published puzzles. Pure → unit-tested without AWS.
 */
export interface AcrosticClue {
  clue: string;
  answer: string;
}

export interface AcrosticCandidate {
  title: string;
  quote: string;
  author: string;
  clues: AcrosticClue[];
}

export interface Validated {
  ok: boolean;
  reason?: string;
  /** Normalized (lowercase-answer) candidate when ok. */
  acrostic?: { title: string; quote: string; author: string; clues: AcrosticClue[] };
}

const isWord = (s: string): boolean => /^[a-z]+$/.test(s);

/** Verify + normalize a candidate acrostic. */
export function validateAcrostic(c: AcrosticCandidate): Validated {
  const quote = c.quote?.trim() ?? '';
  const author = c.author?.trim() ?? '';
  const clues = c.clues ?? [];

  if (quote.length === 0) return { ok: false, reason: 'quote empty' };
  // A real quote must contain letters — a purely numeric/punctuation "quote"
  // (e.g. "123 !!!") trims non-empty but is not a solvable saying, and the
  // progressive word-reveal would render gibberish. Reject it.
  if (!/[a-z]/i.test(quote)) return { ok: false, reason: 'quote has no letters' };
  if (author.length === 0) return { ok: false, reason: 'author missing' };
  if (clues.length < 4) return { ok: false, reason: 'need at least 4 clues' };

  const seen = new Set<string>();
  const norm: AcrosticClue[] = [];
  for (const c0 of clues) {
    const clue = c0.clue?.trim() ?? '';
    const answer = (c0.answer ?? '').trim().toLowerCase();
    if (clue.length === 0) return { ok: false, reason: 'clue text empty' };
    if (!isWord(answer)) return { ok: false, reason: `"${answer}" not a single letters-only word` };
    if (seen.has(answer)) return { ok: false, reason: `"${answer}" repeated` };
    seen.add(answer);
    norm.push({ clue, answer });
  }
  return { ok: true, acrostic: { title: c.title?.trim() ?? '', quote, author, clues: norm } };
}
