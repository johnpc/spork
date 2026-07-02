import { describe, it, expect } from 'vitest';
import { centroidsFor } from './mapClickCentroids';

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
