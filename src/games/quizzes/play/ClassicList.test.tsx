import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClassicList } from './ClassicList';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'George Washington' },
  { id: 'a2', display: 'John Adams' },
] as AnswerRecord[];

describe('ClassicList', () => {
  it('renders one slot per answer under a stable list', () => {
    render(<ClassicList answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('classic-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('classic-blank')).toHaveLength(2);
  });

  it('reveals a found answer label and marks its slot found', () => {
    render(<ClassicList answers={answers} found={new Set(['a2'])} attempt={() => false} />);
    const found = screen.getByTestId('classic-found');
    expect(found).toHaveTextContent('John Adams');
    expect(found).toHaveClass('classic-slot--found');
    expect(screen.queryByText('George Washington')).not.toBeInTheDocument();
  });

  it('numbers slots from 1 in their stable order', () => {
    render(<ClassicList answers={answers} found={new Set()} attempt={() => false} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('1');
    expect(items[1]).toHaveTextContent('2');
  });
});
