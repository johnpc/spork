/**
 * Pure view helpers for the CLICKABLE renderer. A clickable quiz shows a grid of
 * tiles; the CORRECT tiles are the quiz's answers (each carries a stable id that
 * the engine's found set is keyed by), mixed with DECOY tiles that must NOT be
 * clicked (they have no answer id, so clicking one can never score). Keeping the
 * tile assembly pure — and ordering it deterministically — means the grid is
 * unit-testable and never depends on bare Math.random (CLAUDE.md determinism).
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** One rendered tile: a correct answer (id set) or a decoy (id null). */
export interface Tile {
  key: string;
  label: string;
  answerId: string | null;
}

/** Parse a JSON string[] defensively (never throws) — used for the shared decoy
 * pool carried on each answer's `options` field. */
export function parseDecoys(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((d): d is string => typeof d === 'string');
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === 'string') : [];
  } catch {
    return [];
  }
}

/** The decoy pool for a clickable quiz lives (identically) on each answer's
 * `options`; read it off the first answer that carries one. */
export function decoysOf(answers: AnswerRecord[]): string[] {
  for (const a of answers) {
    const parsed = parseDecoys(a.options);
    if (parsed.length) return parsed;
  }
  return [];
}

/** Assemble the full tile set (answers + decoys), sorted for a stable grid. */
export function buildTiles(answers: AnswerRecord[], decoys: string[]): Tile[] {
  const answerTiles: Tile[] = answers.map((a) => ({
    key: `a:${a.id}`,
    label: a.display,
    answerId: a.id,
  }));
  const decoyTiles: Tile[] = decoys.map((label, i) => ({
    key: `d:${i}:${label}`,
    label,
    answerId: null,
  }));
  return [...answerTiles, ...decoyTiles].sort((x, y) => x.label.localeCompare(y.label));
}
