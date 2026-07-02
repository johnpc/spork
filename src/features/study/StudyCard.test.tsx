import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const media = vi.hoisted(() => ({ url: null as string | null }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => media.url }));
vi.mock('../shell/AudioButton', () => ({ AudioButton: () => <div data-testid="audio" /> }));

import { StudyCard } from './StudyCard';
import type { CardRecord } from '../../lib/dataClient';

const card = {
  id: 'c1',
  deckId: 'd1',
  ord: 0,
  front: 'Hola',
  back: 'Hello',
  hint: 'greeting',
  example: '¡Hola!',
  imagePath: 'media/decks/d1/c1.webp',
} as CardRecord;
const choices = { answer: 'Hello', options: ['Hello', 'Bye', 'Thanks', 'Please'] };
const base = { card, choices, direction: 'front' as const, onAnswer: vi.fn(), onNext: vi.fn() };

describe('StudyCard (multiple choice)', () => {
  beforeEach(() => {
    media.url = null;
    vi.clearAllMocks();
  });

  it('shows the front prompt and all options before answering', () => {
    render(<StudyCard {...base} picked={null} />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getAllByTestId('study-opt')).toHaveLength(4);
    expect(screen.queryByTestId('study-after')).not.toBeInTheDocument();
  });

  it('prompts with the back when direction is back', () => {
    const { container } = render(<StudyCard {...base} direction="back" picked={null} />);
    // The prompt face (not an option button) shows the back text.
    expect(container.querySelector('.study-card__front')?.textContent).toBe('Hello');
  });

  it('calls onAnswer with the chosen option', () => {
    const onAnswer = vi.fn();
    render(<StudyCard {...base} picked={null} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: 'Thanks' }));
    expect(onAnswer).toHaveBeenCalledWith('Thanks');
  });

  it('marks correct + chosen-wrong options and reveals Next after answering', () => {
    render(<StudyCard {...base} picked="Bye" />);
    const correct = screen.getByRole('button', { name: 'Hello' });
    const wrong = screen.getByRole('button', { name: 'Bye' });
    expect(correct.className).toContain('study-opt--correct');
    expect(wrong.className).toContain('study-opt--wrong');
    expect(screen.getByTestId('study-after')).toBeInTheDocument();
  });

  it('advances on Next', () => {
    const onNext = vi.fn();
    render(<StudyCard {...base} picked="Hello" onNext={onNext} />);
    fireEvent.click(screen.getByTestId('study-next'));
    expect(onNext).toHaveBeenCalled();
  });

  it('disables options once answered', () => {
    render(<StudyCard {...base} picked="Hello" />);
    expect(screen.getByRole('button', { name: 'Bye' })).toBeDisabled();
  });
});
