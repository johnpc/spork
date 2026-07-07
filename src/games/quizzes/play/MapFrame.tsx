import { ZoomableGroup } from 'react-simple-maps';

/** Frames the map on a computed center + zoom (a continent-sized crop), or renders
 * children directly when there's no frame — either the whole world, or a
 * projection that self-frames (geoAlbersUsa insets AK/HI). Shared by the MAP and
 * CLICKABLE renderers so both crop to the day's region the same way. */
export function MapFrame({
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
