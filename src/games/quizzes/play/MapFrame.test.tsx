import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('react-simple-maps', () => ({
  ZoomableGroup: ({ children }: { children: ReactNode }) => <g data-testid="zoom">{children}</g>,
}));

import { MapFrame } from './MapFrame';

describe('MapFrame', () => {
  it('wraps children in a ZoomableGroup when framed to a region', () => {
    render(
      <MapFrame frame={{ center: [0, 0], zoom: 3 }}>
        <span>child</span>
      </MapFrame>,
    );
    expect(screen.getByTestId('zoom')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders children directly when there is no frame (whole world / self-framing)', () => {
    render(
      <MapFrame frame={null}>
        <span>child</span>
      </MapFrame>,
    );
    expect(screen.queryByTestId('zoom')).not.toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
