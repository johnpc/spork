import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareButton } from './ShareButton';

const props = { game: 'Worldle', score: 3, total: 5, date: '2026-07-03' };

describe('ShareButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share } as unknown as Navigator);
    render(<ShareButton {...props} />);
    fireEvent.click(screen.getByTestId('share-result'));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).toContain('Spork Worldle · 2026-07-03');
  });

  it('falls back to copying and flashes Copied! when share is absent', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } } as unknown as Navigator);
    render(<ShareButton {...props} />);
    fireEvent.click(screen.getByTestId('share-result'));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });
});
