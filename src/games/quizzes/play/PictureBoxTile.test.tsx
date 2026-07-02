import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the media resolver: it turns an S3 key into a presigned URL.
const useMediaUrl = vi.fn();
vi.mock('../../../lib/useMediaUrl', () => ({ useMediaUrl: (p: string | null) => useMediaUrl(p) }));

import { PictureBoxTile } from './PictureBoxTile';
import type { PictureTile } from './pictureTiles';

const tile = (over: Partial<PictureTile>): PictureTile => ({
  id: 'a1',
  image: '',
  label: 'Eiffel Tower',
  found: false,
  ...over,
});

describe('PictureBoxTile', () => {
  it('renders a full URL directly (no media resolution)', () => {
    useMediaUrl.mockReturnValue(null);
    const { container } = render(<PictureBoxTile tile={tile({ image: 'https://x/e.webp' })} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://x/e.webp');
    expect(useMediaUrl).toHaveBeenCalledWith(null); // URL path bypasses the resolver
  });

  it('resolves an S3 media key to a presigned URL', () => {
    useMediaUrl.mockReturnValue('https://s3/presigned');
    const { container } = render(<PictureBoxTile tile={tile({ image: 'quiz/123/answer.webp' })} />);
    expect(useMediaUrl).toHaveBeenCalledWith('quiz/123/answer.webp');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://s3/presigned');
  });

  it('shows an emoji placeholder when the prompt is an emoji', () => {
    useMediaUrl.mockReturnValue(null);
    render(<PictureBoxTile tile={tile({ image: '🗼' })} />);
    expect(screen.getByText('🗼')).toBeInTheDocument();
  });

  it('hides the label until found, then reveals it', () => {
    useMediaUrl.mockReturnValue(null);
    const { rerender } = render(<PictureBoxTile tile={tile({ image: '🗼', found: false })} />);
    expect(screen.getByText('???')).toBeInTheDocument();
    rerender(<PictureBoxTile tile={tile({ image: '🗼', found: true })} />);
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
  });
});
