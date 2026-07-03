import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Download, TESTFLIGHT_URL } from './Download';

describe('Download', () => {
  it('links to the Spork TestFlight beta', () => {
    render(
      <MemoryRouter>
        <Download />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('download')).toBeInTheDocument();
    const cta = screen.getByTestId('download-testflight');
    expect(cta).toHaveAttribute('href', TESTFLIGHT_URL);
    expect(cta).toHaveAttribute('href', 'https://testflight.apple.com/join/b25fhqgK');
    // Opens safely in a new tab.
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
