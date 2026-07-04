import { useMemo, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import type { RendererProps } from './renderers';
import { regionAnswerMap } from './geoFill';
import { currentTarget, mapPrompt, resolveClick, isTargetHit } from './mapClickModel';
import { clickRegionClass } from './clickRegionClass';
import { centroidsFor } from './mapClickCentroids';
import { fitFrame } from './mapClickFit';
import { mapTopologyFor } from './mapTopology';
import './clickable.css';

/**
 * CLICKABLE renderer — "find it on the map". The player is prompted for ONE
 * region at a time ("Find Nigeria" / "Find Texas") and clicks it. The atlas +
 * projection come from the quiz's renderConfig (world countries, or US states via
 * geoAlbersUsa). Only the asked-for region scores; a wrong click flashes red.
 */
export function ClickableMap({ answers, found, attempt, status, renderConfig }: RendererProps) {
  const topo = useMemo(() => mapTopologyFor(renderConfig), [renderConfig]);
  const regionToAnswer = useMemo(() => regionAnswerMap(answers), [answers]);
  const target = useMemo(() => currentTarget(answers, found), [answers, found]);
  // geoAlbersUsa self-frames (insets AK/HI), so only the world map centroid-fits.
  const usa = topo.projection === 'geoAlbersUsa';
  const frame = useMemo(
    () => (usa ? null : fitFrame(centroidsFor(regionToAnswer.keys()))),
    [usa, regionToAnswer],
  );
  const [wrong, setWrong] = useState<string | null>(null);
  const reveal = status === 'done';

  const onRegion = useCallback(
    (geoId: string | number | undefined) => {
      const answerId = resolveClick(geoId, regionToAnswer);
      if (!isTargetHit(answerId, target)) {
        if (answerId) setWrong(answerId);
        return;
      }
      setWrong(null);
      attempt(answerId);
    },
    [regionToAnswer, target, attempt],
  );

  return (
    <div className="clickable-map" data-testid="clickable-grid">
      <p className="clickable-map__prompt" data-testid="clickable-prompt">
        {mapPrompt(target)}
      </p>
      <div className="clickable-map__map">
        <ComposableMap projection={topo.projection} projectionConfig={{ scale: topo.scale }}>
          <MapFrame frame={frame}>
            <Geographies geography={topo.geography}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={clickRegionClass(geo.id, found, regionToAnswer, wrong, reveal)}
                    data-region={String(geo.id)}
                    data-testid={
                      regionToAnswer.get(String(geo.id)) &&
                      found.has(regionToAnswer.get(String(geo.id)) as string)
                        ? 'clickable-found'
                        : 'clickable-region'
                    }
                    onClick={() => onRegion(geo.id)}
                  />
                ))
              }
            </Geographies>
          </MapFrame>
        </ComposableMap>
      </div>
    </div>
  );
}

/** Wrap the map in a ZoomableGroup framed to the answers (world map), or render
 * children directly when the projection self-frames (geoAlbersUsa → frame null). */
function MapFrame({
  frame,
  children,
}: {
  frame: { center: [number, number]; zoom: number } | null;
  children: React.ReactNode;
}) {
  if (!frame) return <>{children}</>;
  return (
    <ZoomableGroup center={frame.center} zoom={frame.zoom}>
      {children}
    </ZoomableGroup>
  );
}
