import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// CardMedia resolves S3 urls (useMediaUrl) — stub it to keep this row test SDK-free.
vi.mock('./CardMedia', () => ({ CardMedia: () => <div data-testid="card-media" /> }));

import { CardEditorRow } from './CardEditorRow';
import type { CardRecord } from '../../lib/dataClient';

const card = { id: 'c1', deckId: 'd1', ord: 0, front: 'Hola', back: 'Hello' } as CardRecord;

function renderRow(overrides = {}) {
  const props = {
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onRegenerate: vi.fn(),
    ...overrides,
  };
  render(<CardEditorRow card={card} {...props} />);
  return props;
}

describe('CardEditorRow', () => {
  it('disables Save until a field changes, then saves the edited values', () => {
    const { onSave } = renderRow();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Front'), { target: { value: 'Buenos días' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ front: 'Buenos días', back: 'Hello' });
  });

  it('deletes and reorders via the callbacks', () => {
    const { onDelete, onMove } = renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Move up'));
    expect(onMove).toHaveBeenCalledWith('up');
    fireEvent.click(screen.getByLabelText('Move down'));
    expect(onMove).toHaveBeenCalledWith('down');
  });

  it('regenerates image and audio via the callback', () => {
    const { onRegenerate } = renderRow();
    fireEvent.click(screen.getByLabelText('Regenerate image'));
    expect(onRegenerate).toHaveBeenCalledWith('image');
    fireEvent.click(screen.getByLabelText('Regenerate audio'));
    expect(onRegenerate).toHaveBeenCalledWith('audio');
  });
});
