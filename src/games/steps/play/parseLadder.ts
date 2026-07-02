/** Pure parsers for a WordLadder's JSON fields (dictionary + parPath). Tolerant
 * of malformed JSON — degrade to empty rather than throw, so a bad row can't
 * crash the play screen. Words are normalized lowercase for case-insensitive
 * play. */
export function parseWordList(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v)
      ? v.filter((s): s is string => typeof s === 'string').map((s) => s.toLowerCase())
      : [];
  } catch {
    return [];
  }
}
