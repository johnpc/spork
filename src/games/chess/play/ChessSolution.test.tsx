import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChessSolution } from './ChessSolution';

describe('ChessSolution', () => {
  it('shows nothing before giving up', () => {
    const { container } = render(<ChessSolution line={['e8e1', 'g1f2', 'e1f1']} gaveUp={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reveals the solution line after giving up', () => {
    render(<ChessSolution line={['e8e1', 'g1f2', 'e1f1']} gaveUp={true} />);
    const solution = screen.getByTestId('chess-solution');
    expect(solution).toBeInTheDocument();
    expect(solution).toHaveTextContent('e8-e1, g1-f2, e1-f1');
  });

  it('displays promotion notation for promoted pawns', () => {
    render(<ChessSolution line={['e7e8q', 'g1f2']} gaveUp={true} />);
    const solution = screen.getByTestId('chess-solution');
    expect(solution).toHaveTextContent('e7-e8=q');
  });

  it('handles empty solution gracefully', () => {
    render(<ChessSolution line={[]} gaveUp={true} />);
    const solution = screen.getByTestId('chess-solution');
    expect(solution).toHaveTextContent('Solution:');
  });
});
