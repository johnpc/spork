import { useMemo } from 'react';
import { Marker } from 'react-simple-maps';
import { smallRegions } from './mapClickCentroids';
import { dotRole } from './mapDots';

/** Below this geodesic area (steradians) a country is too small to see or click
 * as a shape, so it gets a locator dot at its centroid. Calibrated so Luxembourg,
 * Cyprus, Montenegro… get a dot but clickable mediums (Netherlands, Switzerland)
 * keep their shape. */
const SMALL_AREA = 0.0006;

interface RegionDotsProps {
  regionToAnswer: ReadonlyMap<string, string>;
  found: ReadonlySet<string>;
  wrongAnswerId?: string | null;
  reveal?: boolean;
  /** Click handler for the dot's region (CLICKABLE mode). Omit for typed MAP. */
  onRegion?: (regionId: string) => void;
}

/** Locator dots for a quiz's tiny countries — one <Marker> per small in-play
 * region, carrying the SAME role (found/blank/revealed/wrong) as its shape so a
 * micro-nation reads and (in click mode) clicks just like a full-size country. */
export function RegionDots({
  regionToAnswer,
  found,
  wrongAnswerId = null,
  reveal = false,
  onRegion,
}: RegionDotsProps) {
  const dots = useMemo(() => smallRegions(regionToAnswer.keys(), SMALL_AREA), [regionToAnswer]);
  return (
    <>
      {dots.map((d) => (
        <Marker key={d.id} coordinates={d.coordinates}>
          <circle
            r={3}
            className={dotRole(d.id, found, regionToAnswer, wrongAnswerId, reveal)}
            data-region-dot={d.id}
            onClick={onRegion ? () => onRegion(d.id) : undefined}
          />
        </Marker>
      ))}
    </>
  );
}
