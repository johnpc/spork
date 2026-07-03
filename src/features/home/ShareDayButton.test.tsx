import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareDayButton } from './ShareDayButton';

const TEXT = 'Spork · 2026-07-03 · 1/2 done\n🗺️ Worldle 5/6 🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜\nspork.jpc.io';

describe('ShareDayButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when the summary text is empty', () => {
    const { container } = render(<ShareDayButton text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share } as unknown as Navigator);
    render(<ShareDayButton text={TEXT} />);
    fireEvent.click(screen.getByTestId('share-day'));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).toContain('Spork · 2026-07-03');
  });

  it('falls back to copying and flashes Copied! when share is absent', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } } as unknown as Navigator);
    render(<ShareDayButton text={TEXT} />);
    fireEvent.click(screen.getByTestId('share-day'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(TEXT));
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });
});
