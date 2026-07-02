/**
 * Pure validator for a generated word ladder. An LLM proposes a start/target +
 * a solution path + a dictionary; we NEVER trust it — we verify the path is a
 * real ladder (each consecutive pair differs by exactly one letter, all same
 * length, all in the dictionary, start/target match the path ends). Only valid
 * ladders become fixtures/published puzzles. Pure → unit-tested without AWS.
 *
 * Mirrors the play engine's `oneLetterApart` rule so a puzzle that validates
 * here is guaranteed solvable in the game.
 */
export interface LadderCandidate {
  start: string;
  target: string;
  path: string[];
  dictionary: string[];
}

function oneLetterApart(a: string, b: string): boolean {
  if (a.length !== b.length || a === b) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++diffs > 1) return false;
  return diffs === 1;
}

export interface Validated {
  ok: boolean;
  reason?: string;
  /** Normalized (lowercased) candidate when ok. */
  ladder?: { start: string; target: string; parPath: string[]; dictionary: string[] };
}

/** Verify + normalize a candidate ladder. */
export function validateLadder(c: LadderCandidate): Validated {
  const start = c.start?.toLowerCase() ?? '';
  const target = c.target?.toLowerCase() ?? '';
  const path = (c.path ?? []).map((w) => w.toLowerCase());
  const dict = new Set((c.dictionary ?? []).map((w) => w.toLowerCase()));

  if (path.length < 2) return { ok: false, reason: 'path too short' };
  if (path[0] !== start) return { ok: false, reason: 'path does not start at start' };
  if (path[path.length - 1] !== target) return { ok: false, reason: 'path does not end at target' };
  if (start.length !== target.length) return { ok: false, reason: 'start/target length differ' };

  const seen = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const w = path[i];
    if (w.length !== start.length) return { ok: false, reason: `"${w}" wrong length` };
    if (!dict.has(w)) return { ok: false, reason: `"${w}" not in dictionary` };
    if (seen.has(w)) return { ok: false, reason: `"${w}" repeated` };
    seen.add(w);
    if (i > 0 && !oneLetterApart(path[i - 1], w)) {
      return { ok: false, reason: `"${path[i - 1]}"→"${w}" not one letter` };
    }
  }
  // Dictionary must at least contain the whole path; keep the union deduped.
  const dictionary = [...new Set([...path, ...dict])];
  return { ok: true, ladder: { start, target, parPath: path, dictionary } };
}
