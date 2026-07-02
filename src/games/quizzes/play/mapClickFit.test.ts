import { describe, it, expect } from 'vitest';
import { fitFrame } from './mapClickFit';

describe('fitFrame', () => {
  it('frames the whole world when there are no regions', () => {
    expect(fitFrame([])).toEqual({ center: [0, 0], zoom: 1 });
  });

  it('centers on the mean of the region centroids', () => {
    const frame = fitFrame([
      [10, 20],
      [30, 40],
    ]);
    expect(frame.center).toEqual([20, 30]);
  });

  it('zooms in more for a tightly-clustered region than a spread-out one', () => {
    const tight = fitFrame([
      [0, 0],
      [5, 5],
    ]);
    const wide = fitFrame([
      [-80, -40],
      [80, 40],
    ]);
    expect(tight.zoom).toBeGreaterThan(wide.zoom);
  });

  it('clamps zoom to the [1, 8] range', () => {
    const single = fitFrame([[10, 10]]);
    expect(single.zoom).toBeGreaterThanOrEqual(1);
    expect(single.zoom).toBeLessThanOrEqual(8);
  });
});
