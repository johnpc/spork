import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PictureClick } from './PictureClick';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, over: Partial<AnswerRecord> = {}): AnswerRecord =>
  ({
    id,
    promptKind: 'REGION',
    promptValue: id,
    display: id.toUpperCase(),
    hint: `Click ${id.toUpperCase()}`,
    ...over,
  }) as AnswerRecord;

const answers = [mk('nw'), mk('ne'), mk('sw'), mk('se')];

describe('PictureClick', () => {
  it('renders a hotspot per REGION answer with its data-hotspot id', () => {
    render(<PictureClick answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('picture-click')).toBeInTheDocument();
    expect(screen.getByTestId('pc-image').querySelectorAll('[data-hotspot]')).toHaveLength(4);
    expect(screen.getByLabelText('NW').getAttribute('data-hotspot')).toBe('nw');
  });

  it('shows the current target prompt (first unfound region hint)', () => {
    render(<PictureClick answers={answers} found={new Set(['nw'])} attempt={() => false} />);
    expect(screen.getByTestId('pc-prompt')).toHaveTextContent('Click NE');
  });

  it('calls attempt with the answer id when a hotspot is clicked', () => {
    const attempt = vi.fn(() => true);
    render(<PictureClick answers={answers} found={new Set()} attempt={attempt} />);
    fireEvent.click(screen.getByLabelText('NE'));
    expect(attempt).toHaveBeenCalledWith('ne');
  });

  it('marks found hotspots with the found testid, shows their label, and disables them', () => {
    const attempt = vi.fn(() => false);
    render(<PictureClick answers={answers} found={new Set(['nw'])} attempt={attempt} />);
    const found = screen.getByTestId('pc-found');
    expect(found).toHaveTextContent('NW');
    expect(found).toBeDisabled();
    fireEvent.click(found);
    expect(attempt).not.toHaveBeenCalled();
  });

  it('falls back to the answer id for data-hotspot when promptValue is absent', () => {
    render(
      <PictureClick
        answers={[mk('solo', { promptValue: null })]}
        found={new Set()}
        attempt={() => false}
      />,
    );
    expect(screen.getByLabelText('SOLO').getAttribute('data-hotspot')).toBe('solo');
  });

  it('ignores non-REGION answers', () => {
    render(
      <PictureClick
        answers={[mk('x', { promptKind: 'NONE' }), ...answers]}
        found={new Set()}
        attempt={() => false}
      />,
    );
    expect(screen.getByTestId('pc-image').querySelectorAll('[data-hotspot]')).toHaveLength(4);
  });

  it('announces completion when all regions are found', () => {
    render(
      <PictureClick
        answers={answers}
        found={new Set(['nw', 'ne', 'sw', 'se'])}
        attempt={() => false}
      />,
    );
    expect(screen.getByTestId('pc-prompt')).toHaveTextContent('All regions found!');
  });

  it('reveals all hotspot labels when status is done', () => {
    render(
      <PictureClick
        answers={answers}
        found={new Set(['nw', 'sw'])}
        attempt={() => false}
        status="done"
      />,
    );
    expect(screen.getByTestId('pictureclick-reveal')).toBeInTheDocument();
    expect(screen.getByTestId('pc-prompt')).toHaveTextContent('All regions:');
    // All labels shown (found + missed).
    expect(screen.getByText('NW')).toBeInTheDocument();
    expect(screen.getByText('NE')).toBeInTheDocument();
    expect(screen.getByText('SW')).toBeInTheDocument();
    expect(screen.getByText('SE')).toBeInTheDocument();
    // Found hotspots keep pc-found testid; missed get pc-revealed.
    expect(screen.getAllByTestId('pc-found')).toHaveLength(2);
    expect(screen.getAllByTestId('pc-revealed')).toHaveLength(2);
  });
});
