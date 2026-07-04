/** Pure parsers for SpellingBeePuzzle JSON fields (answers + pangrams). Tolerant
 * of malformed JSON — degrade to empty rather than throw. Normalized lowercase. */
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
