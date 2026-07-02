/**
 * Pure validator for a generated acrostic puzzle. An LLM proposes a secret word +
 * quote + author + ordered clues; we NEVER trust it — we verify the ACROSTIC
 * PROPERTY holds: there are exactly as many clues as letters, and clue i's answer
 * starts with letter i of the word. Plus a non-empty quote (with letters), a
 * named author, and distinct single-word (letters-only) answers. Answers are
 * normalized to lowercase. Only valid puzzles become fixtures. Pure → unit-tested.
 */
export interface AcrosticClue {
  clue: string;
  answer: string;
}

export interface AcrosticCandidate {
  word: string;
  title: string;
  quote: string;
  author: string;
  clues: AcrosticClue[];
}

export interface Validated {
  ok: boolean;
  reason?: string;
  /** Normalized candidate when ok. */
  acrostic?: { title: string; quote: string; author: string; clues: AcrosticClue[] };
}

const isWord = (s: string): boolean => /^[a-z]+$/.test(s);

/** Validate + normalize one clue against the letter it must start with. Returns
 * either the normalized clue or a rejection reason. */
function checkClue(
  raw: AcrosticClue,
  letter: string,
  position: number,
  seen: Set<string>,
): { clue?: AcrosticClue; reason?: string } {
  const clue = raw.clue?.trim() ?? '';
  const answer = (raw.answer ?? '').trim().toLowerCase();
  if (clue.length === 0) return { reason: 'clue text empty' };
  if (!isWord(answer)) return { reason: `"${answer}" not a single letters-only word` };
  if (answer[0] !== letter)
    return { reason: `clue ${position} "${answer}" must start with "${letter}"` };
  if (seen.has(answer)) return { reason: `"${answer}" repeated` };
  seen.add(answer);
  return { clue: { clue, answer } };
}

/** Verify the candidate's headline fields; returns a reason if any is invalid. */
function checkHeader(
  word: string,
  quote: string,
  author: string,
  clueCount: number,
): string | null {
  if (!isWord(word)) return 'secret word not letters-only';
  if (quote.length === 0) return 'quote empty';
  if (!/[a-z]/i.test(quote)) return 'quote has no letters';
  if (author.length === 0) return 'author missing';
  if (clueCount !== word.length) return `need exactly ${word.length} clues (one per letter)`;
  return null;
}

/** Verify + normalize a candidate acrostic against its secret `word`. */
export function validateAcrostic(c: AcrosticCandidate): Validated {
  const word = (c.word ?? '').trim().toLowerCase();
  const quote = c.quote?.trim() ?? '';
  const author = c.author?.trim() ?? '';
  const clues = c.clues ?? [];

  const headerReason = checkHeader(word, quote, author, clues.length);
  if (headerReason) return { ok: false, reason: headerReason };

  const seen = new Set<string>();
  const norm: AcrosticClue[] = [];
  for (let i = 0; i < clues.length; i++) {
    const { clue, reason } = checkClue(clues[i], word[i], i + 1, seen);
    if (reason) return { ok: false, reason };
    norm.push(clue as AcrosticClue);
  }
  return { ok: true, acrostic: { title: c.title?.trim() ?? '', quote, author, clues: norm } };
}
