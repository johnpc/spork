/** Resolve "today's puzzle" from a game's published list. Prefer the item stamped
 * with today's date; otherwise fall back to the most recent past-dated item, then
 * to any undated item, so a game always has something to play even before the
 * daily ingestion has stamped today. Pure — the date is injected. */
export interface Dated {
  id: string;
  puzzleDate?: string | null;
}

export function pickDaily<T extends Dated>(items: readonly T[], today: string): T | null {
  if (items.length === 0) return null;
  const exact = items.find((i) => i.puzzleDate === today);
  if (exact) return exact;

  const past = items
    .filter((i) => typeof i.puzzleDate === 'string' && i.puzzleDate <= today)
    .sort((a, b) => (a.puzzleDate! < b.puzzleDate! ? 1 : -1));
  if (past.length > 0) return past[0];

  return items[0];
}
