/**
 * Normalize a typed guess (or an accepted spelling) to a canonical match key.
 * Sporcle-style leniency: case-insensitive, accent-insensitive, punctuation- and
 * whitespace-insensitive. Pure + deterministic — the single source of truth for
 * matching, used both to build the alias index and to key each guess. "Côte
 * d'Ivoire", "cote divoire", and "COTE D IVOIRE" all collapse to "cote divoire".
 */
export function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining accents (diacritical marks)
    .replace(/[^a-z0-9 ]/g, '') // drop punctuation/symbols
    .replace(/\s+/g, ' ') // collapse runs of whitespace
    .trim();
}
