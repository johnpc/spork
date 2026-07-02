import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayDone } from './PlayDone';

describe('PlayDone', () => {
  it('shows the final score + percent and replays', () => {
    const onReplay = vi.fn();
    render(<PlayDone found={3} total={4} onReplay={onReplay} />);
    expect(screen.getByTestId('play-final-score')).toHaveTextContent('3 / 4');
    expect(screen.getByText('75% found')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('play-replay'));
    expect(onReplay).toHaveBeenCalledOnce();
  });
});
