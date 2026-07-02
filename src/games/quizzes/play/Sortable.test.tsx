import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sortable } from './Sortable';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'Banana', bucket: 'Fruit' },
  { id: 'a2', display: 'Carrot', bucket: 'Vegetable' },
] as AnswerRecord[];

describe('Sortable', () => {
  it('renders the unsorted chips and the derived bucket columns', () => {
    render(<Sortable answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('sortable')).toBeInTheDocument();
    expect(screen.getAllByTestId('sortable-item')).toHaveLength(2);
    const buckets = screen.getAllByTestId('sortable-bucket').map((b) => b.textContent);
    expect(buckets).toEqual(['Fruit', 'Vegetable']);
  });

  it('buckets are disabled until an item is selected', () => {
    render(<Sortable answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getAllByTestId('sortable-bucket')[0]).toBeDisabled();
    fireEvent.click(screen.getByText('Banana'));
    expect(screen.getAllByTestId('sortable-bucket')[0]).toBeEnabled();
  });

  it('picking an item then a bucket calls attempt with the answer id and bucket', () => {
    const attempt = vi.fn(() => true);
    render(<Sortable answers={answers} found={new Set()} attempt={attempt} />);
    fireEvent.click(screen.getByText('Banana'));
    fireEvent.click(screen.getByText('Fruit'));
    expect(attempt).toHaveBeenCalledWith('a1', 'Fruit');
  });

  it('found items drop out of the unsorted list', () => {
    render(<Sortable answers={answers} found={new Set(['a1'])} attempt={() => false} />);
    const items = screen.getAllByTestId('sortable-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Carrot');
  });

  it('shows an all-sorted message when every item is found', () => {
    render(<Sortable answers={answers} found={new Set(['a1', 'a2'])} attempt={() => false} />);
    expect(screen.getByTestId('sortable-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('sortable-item')).not.toBeInTheDocument();
  });
});
