import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { regionClass, regionAnswerMap } from './geoFill';
import { mapTopologyFor } from './mapTopology';
import { centroidsFor } from './mapClickCentroids';
import { fitFrame } from './mapClickFit';
import { MapFrame } from './MapFrame';
import { RegionDots } from './RegionDots';
import type { RendererProps } from './renderers';

/**
 * MAP renderer — the first entry in the renderer registry. A quiz's found set
 * (ANSWER IDS) is projected onto the map: each country <path> is mapped to its
 * REGION answer's id, then gets a role class from geoFill (found / blank /
 * revealed / inert). It reads only { answers, found } — the contract every
 * renderer honors. Because usePlay narrows the answer set to the day's continent,
 * the map CROPS to just those regions (fitFrame, same as CLICKABLE) instead of
 * showing the whole globe, and micro-nations get locator dots.
 */
export function WorldMap({ answers, found, status, renderConfig }: RendererProps) {
  // MAP is a typed-input mode: the player types into the shared PlayInput, so
  // this renderer ignores `attempt` and just projects the found set onto the map.
  const topo = useMemo(() => mapTopologyFor(renderConfig), [renderConfig]);
  const regionToAnswer = useMemo(() => regionAnswerMap(answers), [answers]);
  // geoAlbersUsa self-frames; the world map crops to the day's regions.
  const usa = topo.projection === 'geoAlbersUsa';
  const frame = useMemo(
    () => (usa ? null : fitFrame(centroidsFor(regionToAnswer.keys()))),
    [usa, regionToAnswer],
  );
  const reveal = status === 'done';
  return (
    <div className="world-map" data-testid="world-map">
      <ComposableMap projection={topo.projection} projectionConfig={{ scale: topo.scale }}>
        <MapFrame frame={frame}>
          <Geographies geography={topo.geography}>
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
          <RegionDots regionToAnswer={regionToAnswer} found={found} reveal={reveal} />
        </MapFrame>
      </ComposableMap>
    </div>
  );
}
