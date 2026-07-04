/**
 * Resolves a quiz's renderConfig.topology to the actual topojson + projection the
 * map renderers draw. Two atlases today: world countries (default) and US states.
 * Both are imported here — this module only loads inside the lazy map chunk, so
 * text quizzes never pull the topology weight. Adding a map = one entry here.
 */
import worldCountries from 'world-atlas/countries-110m.json';
import usStates from 'us-atlas/states-10m.json';

export interface MapTopology {
  // The Geographies `geography` prop accepts a topojson object, a URL, or a
  // FeatureCollection — typed as Record here (the imported JSON) to satisfy it.
  geography: Record<string, unknown>;
  projection: string;
  scale: number;
}

const WORLD: MapTopology = {
  geography: worldCountries,
  projection: 'geoEqualEarth',
  scale: 155,
};

const US_STATES: MapTopology = {
  geography: usStates,
  // geoAlbersUsa insets Alaska + Hawaii below the mainland — the standard US map.
  projection: 'geoAlbersUsa',
  scale: 900,
};

/** Pick the topology for a renderConfig; defaults to the world map. */
export function mapTopologyFor(config?: { topology?: string } | null): MapTopology {
  return config?.topology === 'states-10m' ? US_STATES : WORLD;
}

/** Parse a quiz's renderConfig JSON string → { topology, projection }. Tolerant:
 * returns null on missing/malformed config (callers fall back to the world map). */
export function parseRenderConfig(raw: unknown): { topology?: string; projection?: string } | null {
  if (typeof raw !== 'string') return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as { topology?: string; projection?: string }) : null;
  } catch {
    return null;
  }
}
