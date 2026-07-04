/**
 * Pure validator for a generated Connections puzzle. An LLM proposes 4 groups
 * of 4 words; we NEVER trust it — we verify: exactly 4 groups, each with
 * exactly 4 words, all 16 words distinct (case-insensitive), each group has a
 * non-empty theme, levels cover 0–3. Only valid puzzles become published rows.
 */
export interface ConnectionsCandidate {
  groups: { theme: string; words: string[]; level: number }[];
}

export interface Validated {
  ok: boolean;
  reason?: string;
  /** Normalized (lowercased words) candidate when ok. */
  connections?: { groups: { theme: string; words: string[]; level: number }[] };
}

/** Verify a single group for theme, word count, word validity, and level. */
function checkGroup(g: { theme: string; words: string[]; level: number }): {
  ok: boolean;
  reason?: string;
} {
  if (!g.theme || g.theme.trim().length === 0) {
    return { ok: false, reason: 'group missing theme' };
  }
  if (!Array.isArray(g.words) || g.words.length !== 4) {
    return { ok: false, reason: `group "${g.theme}" does not have exactly 4 words` };
  }
  if (g.words.some((w) => typeof w !== 'string' || w.trim().length === 0)) {
    return { ok: false, reason: `group "${g.theme}" has empty/invalid word` };
  }
  if (typeof g.level !== 'number' || g.level < 0 || g.level > 3) {
    return { ok: false, reason: `group "${g.theme}" has invalid level (must be 0–3)` };
  }
  return { ok: true };
}

/** Verify + normalize a candidate puzzle. */
export function validateConnections(c: ConnectionsCandidate): Validated {
  if (!c.groups || c.groups.length !== 4) {
    return { ok: false, reason: 'must have exactly 4 groups' };
  }
  const allWords: string[] = [];
  const levels = new Set<number>();
  for (const g of c.groups) {
    const check = checkGroup(g);
    if (!check.ok) return { ok: false, reason: check.reason };
    allWords.push(...g.words.map((w) => w.toLowerCase()));
    levels.add(g.level);
  }
  if (allWords.length !== 16) {
    return { ok: false, reason: 'expected 16 words total' };
  }
  const unique = new Set(allWords);
  if (unique.size !== 16) {
    return { ok: false, reason: 'words are not all distinct (case-insensitive)' };
  }
  if (levels.size !== 4) {
    return { ok: false, reason: 'levels must cover 0–3 (one group per difficulty)' };
  }
  // Normalize
  const groups = c.groups.map((g) => ({
    theme: g.theme,
    words: g.words.map((w) => w.toLowerCase()),
    level: g.level,
  }));
  return { ok: true, connections: { groups } };
}
