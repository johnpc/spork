import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PictureBox } from './PictureBox';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'LeBron James', promptValue: '🏀' },
  { id: 'a2', display: 'Stephen Curry', promptValue: 'https://x/curry.png' },
] as unknown as AnswerRecord[];

describe('PictureBox', () => {
  it('renders a tile per answer and hides labels until found', () => {
    render(<PictureBox answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('picture-box')).toBeInTheDocument();
    expect(screen.getAllByTestId('picture-box-tile')).toHaveLength(2);
    expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    expect(screen.getAllByText('???')).toHaveLength(2);
  });

  it('reveals the label and marks the tile found when its id is in the found set', () => {
    render(<PictureBox answers={answers} found={new Set(['a1'])} attempt={() => false} />);
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getAllByTestId('picture-box-found')).toHaveLength(1);
    expect(screen.getAllByTestId('picture-box-tile')).toHaveLength(1);
  });

  it('renders an <img> for URL prompts and an emoji span otherwise', () => {
    const { container } = render(
      <PictureBox answers={answers} found={new Set(['a2'])} attempt={() => false} />,
    );
    const img = container.querySelector('img.picture-box__image');
    expect(img?.getAttribute('src')).toBe('https://x/curry.png');
    expect(img?.getAttribute('alt')).toBe('Stephen Curry');
    expect(container.querySelector('span.picture-box__image')?.textContent).toBe('🏀');
  });
});
