import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const urls = vi.hoisted(() => ({ map: new Map<string, string>() }));
vi.mock('../../lib/useMediaUrl', () => ({
  useMediaUrl: (p?: string | null) => (p ? (urls.map.get(p) ?? null) : null),
}));

import { CardMedia } from './CardMedia';

describe('CardMedia', () => {
  beforeEach(() => {
    urls.map = new Map([
      ['img.webp', 'https://s3/img.webp'],
      ['aud.mp3', 'https://s3/aud.mp3'],
    ]);
  });

  it('shows the image preview and audio player when present', () => {
    render(<CardMedia imagePath="img.webp" audioPath="aud.mp3" />);
    expect(screen.getByTestId('card-media-img')).toHaveAttribute('src', 'https://s3/img.webp');
    expect(screen.getByTestId('card-media-audio')).toHaveAttribute('src', 'https://s3/aud.mp3');
  });

  it('shows an empty image placeholder and no audio when absent', () => {
    render(<CardMedia imagePath={null} audioPath={null} />);
    expect(screen.queryByTestId('card-media-img')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-media-audio')).not.toBeInTheDocument();
    expect(screen.getByTestId('card-media')).toBeInTheDocument();
  });
});
