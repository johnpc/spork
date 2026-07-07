import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock the topojson import (Vite resolves it at build; tests don't need geometry).
vi.mock('world-atlas/countries-110m.json', () => ({ default: { type: 'Topology' } }));
vi.mock('us-atlas/states-10m.json', () => ({ default: { type: 'Topology' } }));
// Skip topology parsing — the fit only needs some centroids; dot Brazil (076).
vi.mock('./mapClickCentroids', () => ({
  centroidsFor: () => [[10, 10]],
  smallRegions: () => [{ id: '076', coordinates: [-53, -10] }],
}));

// Mock react-simple-maps: ComposableMap + ZoomableGroup + Marker pass children
// through; Geographies invokes its render-prop with fake features; Geography a <path>.
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ZoomableGroup: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  Marker: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  Geographies: ({ children }: { children: (a: { geographies: unknown[] }) => ReactNode }) =>
    children({
      geographies: [
        { rsmKey: 'k1', id: '076' },
        { rsmKey: 'k2', id: '840' },
        { rsmKey: 'k3', id: '999' }, // not an answer → inert
      ],
    }),
  Geography: ({ className, ...rest }: { className: string; [k: string]: unknown }) => (
    <path className={className} data-region={rest['data-region'] as string} />
  ),
}));

import { WorldMap } from './WorldMap';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', promptKind: 'REGION', promptValue: '076' },
  { id: 'a2', promptKind: 'REGION', promptValue: '840' },
] as AnswerRecord[];

describe('WorldMap', () => {
  it('fills found regions, leaves others blank, and marks non-answers inert', () => {
    // found set holds ANSWER IDS — a1 (Brazil/076) is found.
    const { container } = render(
      <WorldMap answers={answers} found={new Set(['a1'])} attempt={() => false} />,
    );
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    const paths = container.querySelectorAll('path');
    const byRegion = (r: string) =>
      Array.from(paths).find((p) => p.getAttribute('data-region') === r);
    expect(byRegion('076')?.getAttribute('class')).toContain('sp-region--found');
    expect(byRegion('840')?.getAttribute('class')).toContain('sp-region--blank');
    expect(byRegion('999')?.getAttribute('class')).toContain('sp-region--inert');
  });

  it('renders a locator dot for a tiny country, mirroring its found role', () => {
    const { container } = render(
      <WorldMap answers={answers} found={new Set(['a1'])} attempt={() => false} />,
    );
    // Brazil (076) is the mocked small region + found → its dot is found too.
    const dot = container.querySelector('[data-region-dot="076"]');
    expect(dot?.getAttribute('class')).toContain('sp-dot--found');
  });
});
