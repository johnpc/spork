import { describe, it, expect } from 'vitest';
import { centroidsFor, smallRegions } from './mapClickCentroids';

describe('centroidsFor', () => {
  it('resolves known ISO ids to plausible [lon,lat] centroids', () => {
    // 566 = Nigeria (~West/Central Africa): lon ~3–13, lat ~4–13.
    const [nigeria] = centroidsFor(['566']);
    expect(nigeria).toBeDefined();
    expect(nigeria[0]).toBeGreaterThan(0);
    expect(nigeria[0]).toBeLessThan(20);
    expect(nigeria[1]).toBeGreaterThan(0);
    expect(nigeria[1]).toBeLessThan(20);
  });

  it('skips ids not present in the topology', () => {
    expect(centroidsFor(['000000'])).toEqual([]);
  });

  it('returns one centroid per resolvable id', () => {
    const out = centroidsFor(['566', '818', '000000']); // Nigeria, Egypt, bogus
    expect(out).toHaveLength(2);
  });
});

describe('smallRegions', () => {
  // 442 = Luxembourg (~6e-5 sr, tiny) vs 250 = France (~1.6e-2 sr, large): a
  // 6e-4 threshold dots Luxembourg but never France.
  const THRESHOLD = 0.0006;

  it('flags a tiny country and skips a large one', () => {
    const dots = smallRegions(['442', '250'], THRESHOLD);
    expect(dots.map((d) => d.id)).toEqual(['442']);
    const [lux] = dots;
    expect(lux.coordinates).toHaveLength(2);
    expect(Number.isFinite(lux.coordinates[0])).toBe(true);
  });

  it('ignores ids not present in the topology', () => {
    expect(smallRegions(['000000'], THRESHOLD)).toEqual([]);
  });
});
