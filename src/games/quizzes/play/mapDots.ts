/**
 * Pure helper for the small-country locator dots. A dot mirrors the role of its
 * region (found / blank / revealed / wrong / inert) so tiny nations read the same
 * as full-size shapes — it just re-skins the class the region already computes
 * (clickRegionClass) from `sp-region--X` to `sp-dot--X`, so the found/reveal/wrong
 * rules live in ONE place. Kept pure so RegionDots stays a thin view.
 */
import { clickRegionClass } from './clickRegionClass';

/** The role class for a small-region dot, derived from its region's role. */
export function dotRole(
  regionId: string,
  found: ReadonlySet<string>,
  regionToAnswer: ReadonlyMap<string, string>,
  wrongAnswerId: string | null = null,
  reveal = false,
): string {
  const region = clickRegionClass(regionId, found, regionToAnswer, wrongAnswerId, reveal);
  // "sp-region sp-region--found" → "sp-dot sp-dot--found".
  const modifier = region.split('sp-region--')[1] ?? 'inert';
  return `sp-dot sp-dot--${modifier}`;
}
