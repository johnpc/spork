/** Assign each seeded puzzle a puzzleDate so the daily model resolves. The LAST
 * fixture in a list is TODAY (so "today's puzzle" always exists), earlier ones
 * step back one day each — giving a little history. Local YYYY-MM-DD. DATA. */
export function dateFor(index: number, count: number, now: Date = new Date()): string {
  const daysAgo = count - 1 - index; // last item → 0 days ago (today)
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
