import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geography from 'world-atlas/countries-110m.json';
import { regionClass, regionAnswerMap } from './geoFill';
import type { RendererProps } from './renderers';

/**
 * MAP renderer — the first entry in the renderer registry. A quiz's found set
 * (ANSWER IDS) is projected onto the world map: each country <path> is mapped
 * to its REGION answer's id, then gets a role class from geoFill (found / blank
 * / inert). It reads only { answers, found } — the contract every renderer
 * honors — so the engine stays mode-agnostic. The topology feature id is the
 * numeric ISO code, matching a REGION answer's promptValue.
 */
export function WorldMap({ answers, found, status }: RendererProps) {
  // MAP is a typed-input mode: the player types into the shared PlayInput, so
  // this renderer ignores `attempt` and just projects the found set onto the map.
  // On give-up/time-up (done) the regions you missed light up as "revealed".
  const regionToAnswer = useMemo(() => regionAnswerMap(answers), [answers]);
  const reveal = status === 'done';
  return (
    <div className="world-map" data-testid="world-map">
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 155 }}>
        <Geographies geography={geography}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className={regionClass(geo.id, found, regionToAnswer, reveal)}
                data-region={String(geo.id)}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
