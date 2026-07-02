import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultipleChoice } from './MultipleChoice';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  {
    id: 'a1',
    display: 'Paris',
    promptValue: 'Capital of France?',
    options: JSON.stringify(['Paris', 'Berlin', 'Rome']),
  },
  {
    id: 'a2',
    display: 'Tokyo',
    promptValue: 'Capital of Japan?',
    options: JSON.stringify(['Beijing', 'Tokyo', 'Seoul']),
  },
] as AnswerRecord[];

describe('MultipleChoice', () => {
  it('shows the first unanswered question and its options', () => {
    render(<MultipleChoice answers={answers} found={new Set()} attempt={() => true} />);
    expect(screen.getByTestId('mc-question')).toHaveTextContent('Capital of France?');
    expect(screen.getAllByTestId('mc-option')).toHaveLength(3);
  });

  it('advances to the next question once one is found', () => {
    render(<MultipleChoice answers={answers} found={new Set(['a1'])} attempt={() => true} />);
    expect(screen.getByTestId('mc-question')).toHaveTextContent('Capital of Japan?');
    expect(screen.getByTestId('mc-found')).toHaveTextContent('1 answered');
  });

  it('calls attempt with the answer id when the correct option is clicked', () => {
    const attempt = vi.fn(() => true);
    render(<MultipleChoice answers={answers} found={new Set()} attempt={attempt} />);
    fireEvent.click(screen.getByText('Paris'));
    expect(attempt).toHaveBeenCalledWith('a1');
  });

  it('does not call attempt when a wrong option is clicked', () => {
    const attempt = vi.fn(() => false);
    render(<MultipleChoice answers={answers} found={new Set()} attempt={attempt} />);
    fireEvent.click(screen.getByText('Berlin'));
    expect(attempt).not.toHaveBeenCalled();
  });

  it('renders a completion message when all are found', () => {
    render(<MultipleChoice answers={answers} found={new Set(['a1', 'a2'])} attempt={() => true} />);
    expect(screen.getByTestId('mc-complete')).toBeInTheDocument();
  });

  it('falls back to display when a question has no promptValue', () => {
    const noPrompt = [
      { id: 'b1', display: 'Solo', options: JSON.stringify(['Solo', 'Other']) },
    ] as AnswerRecord[];
    render(<MultipleChoice answers={noPrompt} found={new Set()} attempt={() => true} />);
    expect(screen.getByTestId('mc-question')).toHaveTextContent('Solo');
  });
});
