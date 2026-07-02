/**
 * Pure model for the CLICKABLE renderer — a "find it on the map" game. The
 * player is given ONE target region at a time (by ord) and must click that
 * country on the map. Reuses the map's region↔answer binding (geoFill) but
 * drives by a prompted target like picture-click, so it only ever scores the
 * country the player was asked for — clicking the wrong country is a miss, not a
 * lucky membership hit. Kept pure so the renderer stays a thin view.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** The region the player is currently asked to click: first (by ord) REGION
 * answer not yet found. Null once every region is found. */
export function currentTarget(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
): AnswerRecord | null {
  return answers.find((a) => a.promptKind === 'REGION' && !found.has(a.id)) ?? null;
}

/** The prompt shown above the map for the active target. */
export function mapPrompt(target: AnswerRecord | null): string {
  if (!target) return 'You found them all!';
  return `Find ${target.display}`;
}

/** Resolve a clicked topology region (numeric ISO) to its answer id, or null if
 * the clicked country isn't part of this quiz. */
export function resolveClick(
  regionId: string | number | undefined,
  regionToAnswer: ReadonlyMap<string, string>,
): string | null {
  const id = regionId == null ? '' : String(regionId);
  return regionToAnswer.get(id) ?? null;
}

/** Whether clicking `answerId` scores the current target (only the asked-for
 * country counts). Non-answers and other countries are misses. */
export function isTargetHit(answerId: string | null, target: AnswerRecord | null): boolean {
  return !!answerId && !!target && answerId === target.id;
}
