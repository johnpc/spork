import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChessBoard } from './ChessBoard';
import type { Piece } from './chess';

const pieces: Piece[] = [
  { sq: 'a1', piece: 'R', side: 'w' },
  { sq: 'a5', piece: 'K', side: 'b' },
];

describe('ChessBoard', () => {
  it('renders every square and the piece glyphs', () => {
    render(<ChessBoard size={5} pieces={pieces} selected={null} onTap={() => {}} />);
    expect(screen.getByTestId('sq-a1')).toBeInTheDocument();
    expect(screen.getByTestId('sq-e5')).toBeInTheDocument();
    expect(screen.getByTestId('piece-a1')).toHaveTextContent('♖');
    expect(screen.getByTestId('piece-a5')).toHaveTextContent('♚');
  });

  it('marks the selected square', () => {
    render(<ChessBoard size={5} pieces={pieces} selected="a1" onTap={() => {}} />);
    expect(screen.getByTestId('sq-a1').className).toContain('chess-sq--selected');
    expect(screen.getByTestId('sq-a5').className).not.toContain('chess-sq--selected');
  });

  it('calls onTap with the square name', () => {
    const onTap = vi.fn();
    render(<ChessBoard size={5} pieces={pieces} selected={null} onTap={onTap} />);
    fireEvent.click(screen.getByTestId('sq-a5'));
    expect(onTap).toHaveBeenCalledWith('a5');
  });
});
