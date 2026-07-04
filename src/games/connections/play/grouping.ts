/**
 * Pure Connections engine. Sort 16 words into 4 hidden themed groups of 4.
 * Select 4 words → submit → if they match a group, that group locks (reveals
 * its theme); otherwise it's a mistake (with a "one away" hint if exactly 3 of
 * the 4 belong to a single group). Fully pure + deterministic for unit tests.
 */

export interface Group {
  theme: string;
  words: readonly string[]; // exactly 4 words
  level: number; // 0=easiest(yellow) .. 3=trickiest(purple)
}

export interface CheckResult {
  solved: Group | null; // the group matched (if any)
  oneAway: boolean; // 3 of the 4 selected belong to one unsolved group
}

/** Check if 4 selected words match any unsolved group. Returns the solved group
 * or, if no match, whether the selection is "one away" (3/4 words from a single
 * group — a hint the player is close). Case-insensitive matching. */
export function checkSelection(
  selected: readonly string[],
  groups: readonly Group[],
  solved: ReadonlySet<number>,
): CheckResult {
  const norm = selected.map((w) => w.toLowerCase());
  for (let i = 0; i < groups.length; i++) {
    if (solved.has(i)) continue;
    const g = groups[i];
    const gWords = g.words.map((w) => w.toLowerCase());
    if (gWords.length === 4 && norm.every((w) => gWords.includes(w))) {
      return { solved: g, oneAway: false };
    }
  }
  // No match — check "one away": 3 of the 4 selected belong to a single group.
  for (let i = 0; i < groups.length; i++) {
    if (solved.has(i)) continue;
    const gWords = groups[i].words.map((w) => w.toLowerCase());
    const overlap = norm.filter((w) => gWords.includes(w)).length;
    if (overlap === 3) return { solved: null, oneAway: true };
  }
  return { solved: null, oneAway: false };
}

export function isWon(solvedCount: number): boolean {
  return solvedCount === 4;
}

export function isLost(mistakes: number, maxMistakes: number): boolean {
  return mistakes >= maxMistakes;
}
