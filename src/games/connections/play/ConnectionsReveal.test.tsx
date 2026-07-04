import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionsReveal } from './ConnectionsReveal';
import type { Group } from './grouping';

const groups: Group[] = [
  { theme: 'Types of Fruit', words: ['apple', 'banana', 'cherry', 'grape'], level: 0 },
  { theme: 'Bodies of Water', words: ['ocean', 'lake', 'river', 'sea'], level: 1 },
  { theme: 'Precious Metals', words: ['gold', 'silver', 'platinum', 'copper'], level: 2 },
  { theme: 'Card Suits', words: ['hearts', 'diamonds', 'clubs', 'spades'], level: 3 },
];

describe('ConnectionsReveal', () => {
  it('renders all 4 groups with themes and words', () => {
    render(<ConnectionsReveal groups={groups} solvedIndices={new Set()} />);
    expect(screen.getByTestId('connections-reveal')).toBeInTheDocument();
    expect(screen.getByText('Types of Fruit')).toBeInTheDocument();
    expect(screen.getByText('apple, banana, cherry, grape')).toBeInTheDocument();
    expect(screen.getByText('Bodies of Water')).toBeInTheDocument();
    expect(screen.getByText('ocean, lake, river, sea')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByText('gold, silver, platinum, copper')).toBeInTheDocument();
    expect(screen.getByText('Card Suits')).toBeInTheDocument();
    expect(screen.getByText('hearts, diamonds, clubs, spades')).toBeInTheDocument();
  });

  it('applies correct level classes', () => {
    const { container } = render(<ConnectionsReveal groups={groups} solvedIndices={new Set()} />);
    const groupEls = container.querySelectorAll('.connections-grid__solved');
    expect(groupEls[0]).toHaveClass('sp-level-0');
    expect(groupEls[1]).toHaveClass('sp-level-1');
    expect(groupEls[2]).toHaveClass('sp-level-2');
    expect(groupEls[3]).toHaveClass('sp-level-3');
  });

  it('marks solved groups with a visual style', () => {
    const { container } = render(
      <ConnectionsReveal groups={groups} solvedIndices={new Set([0, 2])} />,
    );
    const groupEls = container.querySelectorAll('.connections-grid__solved');
    expect(groupEls[0]).toHaveClass('connections-reveal__group--solved');
    expect(groupEls[1]).not.toHaveClass('connections-reveal__group--solved');
    expect(groupEls[2]).toHaveClass('connections-reveal__group--solved');
    expect(groupEls[3]).not.toHaveClass('connections-reveal__group--solved');
  });

  it('renders nothing when groups array is empty', () => {
    const { container } = render(<ConnectionsReveal groups={[]} solvedIndices={new Set()} />);
    expect(container.firstChild).toBeNull();
  });
});
