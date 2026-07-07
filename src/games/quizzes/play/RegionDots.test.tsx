import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';

// 442 (Luxembourg) is small → a dot; 250 (France) is large → no dot.
vi.mock('./mapClickCentroids', () => ({
  smallRegions: () => [{ id: '442', coordinates: [6, 49.8] }],
}));
vi.mock('react-simple-maps', () => ({
  Marker: ({ children }: { children: ReactNode }) => <g>{children}</g>,
}));

import { RegionDots } from './RegionDots';

const regionToAnswer = new Map([
  ['442', 'a1'],
  ['250', 'a2'],
]);

describe('RegionDots', () => {
  it('renders a dot per small region carrying its role class', () => {
    const { container } = render(
      <RegionDots regionToAnswer={regionToAnswer} found={new Set(['a1'])} />,
    );
    const dot = container.querySelector('[data-region-dot="442"]');
    expect(dot?.getAttribute('class')).toContain('sp-dot--found');
  });

  it('wires the click handler to the dot region in click mode', () => {
    const onRegion = vi.fn();
    const { container } = render(
      <RegionDots regionToAnswer={regionToAnswer} found={new Set()} onRegion={onRegion} />,
    );
    fireEvent.click(container.querySelector('[data-region-dot="442"]') as Element);
    expect(onRegion).toHaveBeenCalledWith('442');
  });
});
