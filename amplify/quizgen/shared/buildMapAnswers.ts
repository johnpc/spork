/**
 * Pure builder for a map quiz's answer set. The map TOPOLOGY is the source of
 * truth for which regions exist; this reconciles each topology feature with the
 * canonical ISO country table + curated alias overrides into answer rows. Pure
 * (all reference data injected) so the topology↔ISO↔alias reconciliation is unit
 * -tested without AWS or heavy packages. The caller (start handler) supplies the
 * resolvers from i18n-iso-countries at generation time.
 */

/** One region from the map topology: the numeric ISO id + the topology's label. */
export interface TopologyRegion {
  id: string; // numeric ISO 3166-1 (matches the topojson feature id)
  name: string; // the topology's own label, a fallback display name
}

/** Reference lookups injected from i18n-iso-countries (kept out of this pure fn). */
export interface IsoResolvers {
  /** All known English names for a numeric id (official/short/abbrev), or []. */
  namesForNumeric: (numeric: string) => string[];
  /** alpha-2 for a numeric id (to look up alias overrides), or null. */
  alpha2ForNumeric: (numeric: string) => string | null;
  /** alpha-3 for a numeric id (a common accepted spelling), or null. */
  alpha3ForNumeric: (numeric: string) => string | null;
}

/** An answer row ready to write, in the universal Answer shape. A map answer is
 * a REGION-kind prompt whose promptValue is the numeric ISO region id. */
export interface MapAnswer {
  ord: number;
  promptKind: 'REGION';
  promptValue: string; // numeric ISO region id (matches the topology feature id)
  display: string;
  accepted: string[]; // RAW spellings; the client normalizes at index build
}

/**
 * Build answer rows from the topology. Regions with no numeric id (disputed /
 * unrecognized territories the topology can't key) are skipped — they render as
 * un-fillable background, not answers. `display` prefers the topology's own
 * label (the mapmaker's natural short name, e.g. "South Korea"), falling back to
 * the ISO name. `accepted` unions every ISO name, the topology label, the
 * alpha-2/3 codes, and any curated overrides — deduped, order-stable.
 */
export function buildMapAnswers(
  regions: TopologyRegion[],
  iso: IsoResolvers,
  aliasOverrides: Record<string, string[]>,
): MapAnswer[] {
  const answers: MapAnswer[] = [];
  for (const region of regions) {
    if (!region.id) continue;
    const isoNames = iso.namesForNumeric(region.id);
    const alpha2 = iso.alpha2ForNumeric(region.id);
    const alpha3 = iso.alpha3ForNumeric(region.id);
    const overrides = alpha2 ? (aliasOverrides[alpha2] ?? []) : [];
    const accepted = [region.name, ...isoNames, alpha2, alpha3, ...overrides].filter(
      (s): s is string => !!s,
    );
    answers.push({
      ord: answers.length,
      promptKind: 'REGION',
      promptValue: region.id,
      display: region.name || (isoNames[0] ?? region.id),
      accepted: dedupe(accepted),
    });
  }
  return answers;
}

/** Case-insensitive dedupe that keeps first-seen casing and order. */
function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}
