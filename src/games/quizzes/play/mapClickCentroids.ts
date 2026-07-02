/**
 * Derive each country's [lon,lat] centroid from the world-atlas topology, keyed
 * by numeric-ISO id (matching REGION answers' promptValue). Impure glue over
 * topojson + d3-geo, memoized once — the pure framing math lives in mapClickFit.
 */
import { geoCentroid, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import topology from 'world-atlas/countries-110m.json';

// Minimal shape of the world-atlas topology we consume (avoids a types-only dep).
type CountriesTopology = Parameters<typeof feature>[0] & {
  objects: { countries: Parameters<typeof feature>[1] };
};

let cache: Map<string, [number, number]> | null = null;

function build(): Map<string, [number, number]> {
  const map = new Map<string, [number, number]>();
  // world-atlas ships a Topology; `feature` expands it into a FeatureCollection.
  const topo = topology as unknown as CountriesTopology;
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection;
  for (const f of fc.features) {
    if (f.id == null) continue;
    const c = geoCentroid(f as GeoPermissibleObjects);
    if (Number.isFinite(c[0]) && Number.isFinite(c[1])) map.set(String(f.id), [c[0], c[1]]);
  }
  return map;
}

/** region ISO id → centroid, computed once. */
export function centroidsFor(isoIds: Iterable<string>): Array<[number, number]> {
  if (!cache) cache = build();
  const out: Array<[number, number]> = [];
  for (const id of isoIds) {
    const c = cache.get(id);
    if (c) out.push(c);
  }
  return out;
}
