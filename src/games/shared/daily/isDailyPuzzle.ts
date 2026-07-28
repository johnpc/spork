/**
 * True when a puzzle id is a daily-generated one (`daily-<game>-<date>`, written
 * by the scheduled daily ingest). Daily puzzles live on the `/daily/:game`
 * browse surface, so the evergreen game-list pages filter them OUT — otherwise
 * every past day accumulates into an unbounded wall of links (ingest runs daily).
 * Pure/deterministic → unit-tested without the client.
 */
export function isDailyPuzzle(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith('daily-');
}
