import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderUp } from './OrderUp';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'First', orderIndex: 0 },
  { id: 'a2', display: 'Second', orderIndex: 1 },
  { id: 'a3', display: 'Third', orderIndex: 2 },
] as AnswerRecord[];

const renderIt = (found: Set<string>, attempt = vi.fn(() => false)) =>
  render(<OrderUp answers={answers} found={found} attempt={attempt} />);

describe('OrderUp', () => {
  it('renders a clickable button per item with the progress count', () => {
    renderIt(new Set());
    expect(screen.getByTestId('order-up')).toBeInTheDocument();
    expect(screen.getByTestId('order-up-progress')).toHaveTextContent('0 of 3 placed');
    expect(screen.getAllByTestId('order-up-item')).toHaveLength(3);
  });

  it('calls attempt with the answer id when an item is clicked', () => {
    const attempt = vi.fn(() => true);
    renderIt(new Set(), attempt);
    const first = screen.getByText('First').closest('button');
    fireEvent.click(first as HTMLButtonElement);
    expect(attempt).toHaveBeenCalledWith('a1');
  });

  it('marks found items placed, disables them, and shows their 1-based rank', () => {
    renderIt(new Set(['a1']));
    expect(screen.getByTestId('order-up-progress')).toHaveTextContent('1 of 3 placed');
    const placed = screen.getByTestId('order-up-placed');
    expect(placed).toBeDisabled();
    expect(placed).toHaveTextContent('First');
    expect(placed).toHaveTextContent('1'); // orderIndex 0 → rank 1
    expect(screen.getAllByTestId('order-up-item')).toHaveLength(2);
  });
});
