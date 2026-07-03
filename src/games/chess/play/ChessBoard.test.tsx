import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChessBoard } from './ChessBoard';
import type { BoardPiece } from './chess';

const pieces: BoardPiece[] = [
  { sq: 'a1', type: 'r', color: 'w' },
  { sq: 'g8', type: 'k', color: 'b' },
];

describe('ChessBoard', () => {
  it('renders every square and the piece glyphs', () => {
    render(<ChessBoard pieces={pieces} selected={null} targets={[]} onTap={() => {}} />);
    expect(screen.getByTestId('sq-a1')).toBeInTheDocument();
    expect(screen.getByTestId('sq-h8')).toBeInTheDocument();
    expect(screen.getByTestId('piece-a1')).toHaveTextContent('♜'); // solid; color via CSS
    expect(screen.getByTestId('piece-g8')).toHaveTextContent('♚');
  });

  it('marks the selected square and legal targets', () => {
    render(<ChessBoard pieces={pieces} selected="a1" targets={['a8']} onTap={() => {}} />);
    expect(screen.getByTestId('sq-a1').className).toContain('chess-sq--selected');
    expect(screen.getByTestId('sq-a8').className).toContain('chess-sq--target');
    expect(screen.getByTestId('sq-g8').className).not.toContain('chess-sq--selected');
  });

  it('calls onTap with the square name', () => {
    const onTap = vi.fn();
    render(<ChessBoard pieces={pieces} selected={null} targets={[]} onTap={onTap} />);
    fireEvent.click(screen.getByTestId('sq-g8'));
    expect(onTap).toHaveBeenCalledWith('g8');
  });
});
