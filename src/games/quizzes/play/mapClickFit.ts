/**
 * Compute how to frame the CLICKABLE map on just the quiz's regions, so a
 * "click the African countries" quiz opens zoomed to Africa rather than the
 * whole globe. Pure: given the quiz's region ISO codes + a lookup of each
 * region's [lon,lat] centroid, return a ZoomableGroup center + zoom. The
 * centroid lookup is derived once from the topology (mapClickCentroids), keeping
 * d3/topojson out of this unit-tested helper.
 */
export interface MapFrame {
  center: [number, number];
  zoom: number;
}

const WORLD: MapFrame = { center: [0, 0], zoom: 1 };

/** Frame the map around the given region centroids. Centers on their mean and
 * zooms so the lon/lat span fills the viewport (clamped to a sane range). */
export function fitFrame(centroids: Array<[number, number]>): MapFrame {
  if (centroids.length === 0) return WORLD;
  const lons = centroids.map((c) => c[0]);
  const lats = centroids.map((c) => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
  // Pad the span so edge countries aren't clipped, then pick the ZoomableGroup
  // zoom (a multiplier on the base projection scale) that fits the tighter of
  // the two axes. Constants are calibrated so a continent-sized span (~70°)
  // lands near zoom 3 in the 4:3 map box.
  const spanLon = (maxLon - minLon || 20) * 1.5;
  const spanLat = (maxLat - minLat || 20) * 1.5;
  const zoom = Math.max(1, Math.min(8, Math.min(300 / spanLon, 170 / spanLat)));
  return { center, zoom };
}
