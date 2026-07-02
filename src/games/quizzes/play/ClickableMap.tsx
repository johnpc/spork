import { useMemo, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import geography from 'world-atlas/countries-110m.json';
import type { RendererProps } from './renderers';
import { regionAnswerMap } from './geoFill';
import { currentTarget, mapPrompt, resolveClick, isTargetHit } from './mapClickModel';
import { clickRegionClass } from './clickRegionClass';
import { centroidsFor } from './mapClickCentroids';
import { fitFrame } from './mapClickFit';
import './clickable.css';

/**
 * CLICKABLE renderer — "find it on the map". The player is prompted for ONE
 * country at a time ("Find Nigeria") and clicks it on a map zoomed to the quiz's
 * region (auto-framed from the answers' centroids). Only the asked-for country
 * scores; a wrong click flashes red. Reuses the map's region↔answer binding.
 */
export function ClickableMap({ answers, found, attempt, status }: RendererProps) {
  const regionToAnswer = useMemo(() => regionAnswerMap(answers), [answers]);
  const target = useMemo(() => currentTarget(answers, found), [answers, found]);
  const frame = useMemo(() => fitFrame(centroidsFor(regionToAnswer.keys())), [regionToAnswer]);
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
        <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 155 }}>
          <ZoomableGroup center={frame.center} zoom={frame.zoom}>
            <Geographies geography={geography}>
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
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
