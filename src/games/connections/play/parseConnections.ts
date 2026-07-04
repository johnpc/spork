/**
 * Pure parsers for ConnectionsPuzzle's JSON `groups` field + a deterministic
 * tile shuffle. Tolerant of malformed JSON (degrade to empty). The shuffle
 * takes injected RNG for testability (no bare Math.random in tested logic).
 */
import type { Group } from './grouping';

export type { Group };

export type RNG = () => number;

/** Parse the `groups` JSON string → typed Group[]. Validates shape defensively. */
export function parseGroups(json: string | null | undefined): Group[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (g): g is { theme: string; words: string[]; level: number } =>
          typeof g === 'object' &&
          g !== null &&
          typeof g.theme === 'string' &&
          Array.isArray(g.words) &&
          g.words.length === 4 &&
          g.words.every((w: unknown): w is string => typeof w === 'string') &&
          typeof g.level === 'number',
      )
      .map((g) => ({ theme: g.theme, words: g.words, level: g.level }));
  } catch {
    return [];
  }
}

/** Flatten 4 groups of 4 words into 16 tiles, shuffled via the injected RNG
 * (deterministic for tests). Fisher-Yates shuffle. */
export function shuffleTiles(groups: readonly Group[], rng: RNG): string[] {
  const flat = groups.flatMap((g) => g.words);
  const arr = [...flat];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Simple string hash for a stable shuffle seed (deterministic per puzzle id). */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** Seeded RNG (LCG) for deterministic shuffles. Returns [0, 1). */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}
