import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Slideshow } from './Slideshow';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (o: Partial<AnswerRecord>): AnswerRecord => o as AnswerRecord;

const answers: AnswerRecord[] = [
  mk({ id: 'a', display: 'Alpha', promptKind: 'TEXT', promptValue: 'First clue', orderIndex: 0 }),
  mk({ id: 'b', display: 'Beta', promptKind: 'IMAGE', promptValue: 'img/b.png', orderIndex: 1 }),
];

describe('Slideshow', () => {
  it('shows the current TEXT slide prompt and 1-based progress', () => {
    render(<Slideshow answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('slideshow')).toBeInTheDocument();
    expect(screen.getByText('First clue')).toBeInTheDocument();
    expect(screen.getByTestId('slideshow-progress')).toHaveTextContent('1 / 2');
  });

  it('advances to the next unfound slide once the first is found', () => {
    render(<Slideshow answers={answers} found={new Set(['a'])} attempt={() => false} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img/b.png');
    expect(screen.getByTestId('slideshow-progress')).toHaveTextContent('2 / 2');
  });

  it('shows a cleared message when every slide is found', () => {
    render(<Slideshow answers={answers} found={new Set(['a', 'b'])} attempt={() => false} />);
    expect(screen.getByTestId('slideshow-cleared')).toBeInTheDocument();
    expect(screen.queryByTestId('slideshow-slide')).not.toBeInTheDocument();
  });

  it('Skip advances to the next unfound slide without scoring, and cycles back', () => {
    render(<Slideshow answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByText('First clue')).toBeInTheDocument();
    // Skip → the second slide (unscored: found is unchanged, driven by cursor only).
    fireEvent.click(screen.getByTestId('slideshow-skip'));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'img/b.png');
    expect(screen.getByTestId('slideshow-progress')).toHaveTextContent('2 / 2');
    // Skip again → wraps back to the first slide (nothing was marked found).
    fireEvent.click(screen.getByTestId('slideshow-skip'));
    expect(screen.getByText('First clue')).toBeInTheDocument();
  });

  it('hides Skip when only one slide remains (nothing to skip to)', () => {
    render(<Slideshow answers={answers} found={new Set(['a'])} attempt={() => false} />);
    expect(screen.queryByTestId('slideshow-skip')).not.toBeInTheDocument();
  });
});
