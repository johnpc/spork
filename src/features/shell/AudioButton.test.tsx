import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const media = vi.hoisted(() => ({ url: null as string | null }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => media.url }));

import { AudioButton } from './AudioButton';

describe('AudioButton', () => {
  it('renders nothing until the URL resolves', () => {
    media.url = null;
    render(<AudioButton audioPath="a.mp3" />);
    expect(screen.queryByTestId('card-media-audio')).not.toBeInTheDocument();
  });

  it('renders a lazy (preload=none) audio control once resolved', () => {
    media.url = 'https://s3/a.mp3';
    render(<AudioButton audioPath="a.mp3" />);
    const el = screen.getByTestId('card-media-audio');
    expect(el).toHaveAttribute('src', 'https://s3/a.mp3');
    expect(el).toHaveAttribute('preload', 'none');
  });
});
