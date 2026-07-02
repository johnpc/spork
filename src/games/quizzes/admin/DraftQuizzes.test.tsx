import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DraftQuizzes } from './DraftQuizzes';
import type { QuizRecord } from '../../../lib/dataClient';

const drafts = [{ id: 'q1', topic: 'Presidents', mode: 'CLASSIC', answerCount: 8 } as QuizRecord];

describe('DraftQuizzes', () => {
  it('shows an empty message when there are no drafts', () => {
    render(<DraftQuizzes drafts={[]} onPublish={vi.fn()} publishingId={null} />);
    expect(screen.getByTestId('drafts-empty')).toBeInTheDocument();
  });

  it('lists drafts and publishes on click', () => {
    const onPublish = vi.fn();
    render(<DraftQuizzes drafts={drafts} onPublish={onPublish} publishingId={null} />);
    expect(screen.getByText('Presidents')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('quiz-publish'));
    expect(onPublish).toHaveBeenCalledWith('q1');
  });

  it('disables the button while that draft is publishing', () => {
    render(<DraftQuizzes drafts={drafts} onPublish={vi.fn()} publishingId="q1" />);
    expect(screen.getByTestId('quiz-publish')).toBeDisabled();
  });
});
