import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClickableGrid } from './ClickableGrid';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'Egypt', options: '["France","Peru"]' },
  { id: 'a2', display: 'Kenya' },
] as AnswerRecord[];

describe('ClickableGrid', () => {
  it('renders a tile per answer plus the shared decoy pool', () => {
    render(<ClickableGrid answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('clickable-grid')).toBeInTheDocument();
    for (const label of ['Egypt', 'Kenya', 'France', 'Peru']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('calls attempt with the answer id when a correct tile is clicked', () => {
    const attempt = vi.fn(() => true);
    render(<ClickableGrid answers={answers} found={new Set()} attempt={attempt} />);
    fireEvent.click(screen.getByText('Egypt'));
    expect(attempt).toHaveBeenCalledWith('a1');
  });

  it('marks a tile found (from the engine set) and stops re-attempting it', () => {
    const attempt = vi.fn(() => true);
    render(<ClickableGrid answers={answers} found={new Set(['a1'])} attempt={attempt} />);
    const egypt = screen.getByText('Egypt');
    expect(egypt.className).toContain('clickable-tile--found');
    expect(screen.getAllByTestId('clickable-found').length).toBe(1);
    fireEvent.click(egypt);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('flashes a miss on a decoy tile (id null → never scores)', () => {
    const attempt = vi.fn(() => false);
    render(<ClickableGrid answers={answers} found={new Set()} attempt={attempt} />);
    const france = screen.getByText('France');
    fireEvent.click(france);
    expect(attempt).toHaveBeenCalledWith(null);
    expect(france.className).toContain('clickable-tile--missed');
  });
});
