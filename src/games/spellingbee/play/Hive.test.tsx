import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Hive } from './Hive';

describe('Hive', () => {
  it('renders 7 hex buttons (1 center + 6 outer)', () => {
    const onLetterClick = vi.fn();
    render(
      <Hive
        centerLetter="a"
        outerLetters={['b', 'c', 'd', 'e', 'f', 'g']}
        onLetterClick={onLetterClick}
      />,
    );
    expect(screen.getByTestId('hex-a')).toHaveTextContent('A');
    expect(screen.getByTestId('hex-a')).toHaveAttribute('data-center', 'true');
    expect(screen.getByTestId('hex-b')).toHaveTextContent('B');
    expect(screen.getByTestId('hex-c')).toHaveTextContent('C');
    expect(screen.getByTestId('hex-d')).toHaveTextContent('D');
    expect(screen.getByTestId('hex-e')).toHaveTextContent('E');
    expect(screen.getByTestId('hex-f')).toHaveTextContent('F');
    expect(screen.getByTestId('hex-g')).toHaveTextContent('G');
  });

  it('calls onLetterClick when a hex is clicked', () => {
    const onLetterClick = vi.fn();
    render(
      <Hive
        centerLetter="a"
        outerLetters={['b', 'c', 'd', 'e', 'f', 'g']}
        onLetterClick={onLetterClick}
      />,
    );
    fireEvent.click(screen.getByTestId('hex-a'));
    expect(onLetterClick).toHaveBeenCalledWith('a');
    fireEvent.click(screen.getByTestId('hex-b'));
    expect(onLetterClick).toHaveBeenCalledWith('b');
    fireEvent.click(screen.getByTestId('hex-d'));
    expect(onLetterClick).toHaveBeenCalledWith('d');
    fireEvent.click(screen.getByTestId('hex-e'));
    expect(onLetterClick).toHaveBeenCalledWith('e');
    fireEvent.click(screen.getByTestId('hex-g'));
    expect(onLetterClick).toHaveBeenCalledWith('g');
  });
});
