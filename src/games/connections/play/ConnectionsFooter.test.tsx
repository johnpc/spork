import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectionsFooter } from './ConnectionsFooter';
import type { Group } from './grouping';

const groups: Group[] = [
  { theme: 'Types of Fruit', words: ['apple', 'banana', 'cherry', 'grape'], level: 0 },
  { theme: 'Bodies of Water', words: ['ocean', 'lake', 'river', 'sea'], level: 1 },
  { theme: 'Precious Metals', words: ['gold', 'silver', 'platinum', 'copper'], level: 2 },
  { theme: 'Card Suits', words: ['hearts', 'diamonds', 'clubs', 'spades'], level: 3 },
];

const base = {
  won: false,
  lost: false,
  done: false,
  oneAway: false,
  canDeselect: false,
  canSubmit: false,
  onDeselectAll: vi.fn(),
  onSubmit: vi.fn(),
  groups,
  solvedIndices: new Set<number>(),
};

describe('ConnectionsFooter', () => {
  it('shows the win banner when won', () => {
    render(<ConnectionsFooter {...base} won done />);
    expect(screen.getByTestId('connections-won')).toBeInTheDocument();
  });

  it('shows the reveal with all 4 groups when lost', () => {
    render(<ConnectionsFooter {...base} lost done />);
    expect(screen.getByTestId('connections-reveal')).toBeInTheDocument();
    expect(screen.getByText('Types of Fruit')).toBeInTheDocument();
    expect(screen.getByText('Bodies of Water')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByText('Card Suits')).toBeInTheDocument();
  });

  it('does not show the reveal while playing', () => {
    render(<ConnectionsFooter {...base} />);
    expect(screen.queryByTestId('connections-reveal')).not.toBeInTheDocument();
  });

  it('does not show the reveal on win', () => {
    render(<ConnectionsFooter {...base} won done />);
    expect(screen.queryByTestId('connections-reveal')).not.toBeInTheDocument();
  });

  it('shows the one-away hint and controls while playing', () => {
    render(<ConnectionsFooter {...base} oneAway canDeselect canSubmit />);
    expect(screen.getByTestId('connections-hint')).toBeInTheDocument();
    expect(screen.getByTestId('connections-submit')).toBeEnabled();
  });

  it('hides controls once done', () => {
    render(<ConnectionsFooter {...base} won done />);
    expect(screen.queryByTestId('connections-submit')).not.toBeInTheDocument();
  });

  it('fires the callbacks', () => {
    const onDeselectAll = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ConnectionsFooter
        {...base}
        canDeselect
        canSubmit
        onDeselectAll={onDeselectAll}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByText('Deselect All'));
    fireEvent.click(screen.getByTestId('connections-submit'));
    expect(onDeselectAll).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
