/**
 * Role class for a topology region in the CLICKABLE (find-it-on-the-map) mode.
 * Unlike the MAP renderer (which just projects the found set), here a region can
 * also be flashing "wrong" (the player clicked it but it wasn't the target).
 * Regions not in this quiz stay inert. Pure so ClickableMap stays a thin view.
 */
export function clickRegionClass(
  regionId: string | number | undefined,
  found: ReadonlySet<string>,
  regionToAnswer: ReadonlyMap<string, string>,
  wrongAnswerId: string | null,
  reveal = false,
): string {
  const id = regionId == null ? '' : String(regionId);
  const answerId = regionToAnswer.get(id);
  if (!answerId) return 'sp-region sp-region--inert';
  if (found.has(answerId)) return 'sp-region sp-region--found';
  if (wrongAnswerId && wrongAnswerId === answerId) return 'sp-region sp-region--wrong';
  return reveal ? 'sp-region sp-region--revealed' : 'sp-region sp-region--blank';
}
