/**
 * Pure model for the PICTURE_CLICK renderer. A single labeled image carries
 * hotspots (one per REGION answer, keyed by promptValue). The player is given a
 * prompt naming ONE target region and clicks the matching hotspot. This module
 * holds the non-React logic — which answer is the active target, and the role
 * class for each hotspot — so the renderer stays a thin view and both are
 * unit-tested in isolation.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** The answer the player is currently being asked to click: the first (by ord)
 * REGION answer not yet in the found set. Null once every region is found. */
export function currentTarget(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
): AnswerRecord | null {
  return answers.find((a) => a.promptKind === 'REGION' && !found.has(a.id)) ?? null;
}

/** The prompt text shown to the player — the target's hint, else its display. */
export function promptText(target: AnswerRecord | null): string {
  if (!target) return 'All regions found!';
  return target.hint ?? `Click ${target.display}`;
}

export type HotspotRole = 'found' | 'target' | 'idle';

/** Role for one hotspot: found (already clicked correctly), target (the active
 * prompt, awaiting a click), or idle (a not-yet-prompted region). */
export function hotspotRole(
  answer: AnswerRecord,
  found: ReadonlySet<string>,
  target: AnswerRecord | null,
): HotspotRole {
  if (found.has(answer.id)) return 'found';
  if (target && target.id === answer.id) return 'target';
  return 'idle';
}

/** The CSS role class for a hotspot — token-driven fills live in pictureClick.css. */
export function hotspotClass(role: HotspotRole): string {
  return `pc-hotspot pc-hotspot--${role}`;
}
