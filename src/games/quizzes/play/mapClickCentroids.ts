/**
 * Derive each country's [lon,lat] centroid from the world-atlas topology, keyed
 * by numeric-ISO id (matching REGION answers' promptValue). Impure glue over
 * topojson + d3-geo, memoized once — the pure framing math lives in mapClickFit.
 */
import { geoCentroid, geoArea, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import topology from 'world-atlas/countries-110m.json';

// Minimal shape of the world-atlas topology we consume (avoids a types-only dep).
type CountriesTopology = Parameters<typeof feature>[0] & {
  objects: { countries: Parameters<typeof feature>[1] };
};

/** A country's derived geometry: [lon,lat] centroid + geodesic area (steradians). */
interface RegionGeo {
  coordinates: [number, number];
  area: number;
}

/** A small country that needs a locator dot (too tiny to see/click as a shape). */
export interface RegionDot {
  id: string;
  coordinates: [number, number];
}

let cache: Map<string, RegionGeo> | null = null;

function build(): Map<string, RegionGeo> {
  const map = new Map<string, RegionGeo>();
  // world-atlas ships a Topology; `feature` expands it into a FeatureCollection.
  const topo = topology as unknown as CountriesTopology;
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection;
  for (const f of fc.features) {
    if (f.id == null) continue;
    const c = geoCentroid(f as GeoPermissibleObjects);
    if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
      map.set(String(f.id), {
        coordinates: [c[0], c[1]],
        area: geoArea(f as GeoPermissibleObjects),
      });
    }
  }
  return map;
}

function geo(): Map<string, RegionGeo> {
  if (!cache) cache = build();
  return cache;
}

/** region ISO id → centroid, computed once. */
export function centroidsFor(isoIds: Iterable<string>): Array<[number, number]> {
  const g = geo();
  const out: Array<[number, number]> = [];
  for (const id of isoIds) {
    const c = g.get(id);
    if (c) out.push(c.coordinates);
  }
  return out;
}

/** The subset of `isoIds` whose land area is below `threshold` steradians — the
 * countries too small to see or click as a shape, so they get a locator dot. */
export function smallRegions(isoIds: Iterable<string>, threshold: number): RegionDot[] {
  const g = geo();
  const out: RegionDot[] = [];
  for (const id of isoIds) {
    const r = g.get(id);
    if (r && r.area < threshold) out.push({ id, coordinates: r.coordinates });
  }
  return out;
}
