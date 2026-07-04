import { describe, it, expect } from 'vitest';
import { mapTopologyFor, parseRenderConfig } from './mapTopology';

describe('mapTopologyFor', () => {
  it('defaults to the world map (geoEqualEarth)', () => {
    expect(mapTopologyFor(null).projection).toBe('geoEqualEarth');
    expect(mapTopologyFor({}).projection).toBe('geoEqualEarth');
  });
  it('selects the US states atlas for states-10m (geoAlbersUsa)', () => {
    const us = mapTopologyFor({ topology: 'states-10m' });
    expect(us.projection).toBe('geoAlbersUsa');
    expect(us.geography).toBeTruthy();
  });
});

describe('parseRenderConfig', () => {
  it('parses a valid JSON config', () => {
    expect(parseRenderConfig('{"topology":"states-10m","projection":"geoAlbersUsa"}')).toEqual({
      topology: 'states-10m',
      projection: 'geoAlbersUsa',
    });
  });
  it('returns null for missing or malformed config', () => {
    expect(parseRenderConfig(null)).toBeNull();
    expect(parseRenderConfig(undefined)).toBeNull();
    expect(parseRenderConfig('not json')).toBeNull();
    expect(parseRenderConfig(42)).toBeNull();
  });
});
