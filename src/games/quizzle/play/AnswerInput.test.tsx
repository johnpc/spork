import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnswerInput } from './AnswerInput';
import type { QuizzleQuestion } from './quizzleEngine';

const question: QuizzleQuestion = {
  question: 'Capital of France?',
  answer: 'Paris',
  accepted: [],
};

describe('AnswerInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-submits the moment the typed answer is correct (no Enter)', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput question={question} onAnswer={onAnswer} />);
    fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'Paris' } });
    expect(onAnswer).toHaveBeenCalledWith('Paris');
  });

  it('does not auto-submit a partial / wrong answer', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput question={question} onAnswer={onAnswer} />);
    fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'Par' } });
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('submits a wrong answer only on explicit submit (Enter/button)', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput question={question} onAnswer={onAnswer} />);
    fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'London' } });
    expect(onAnswer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('answer-submit'));
    expect(onAnswer).toHaveBeenCalledWith('London');
  });

  it('ignores an empty submit', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput question={question} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByTestId('answer-submit'));
    expect(onAnswer).not.toHaveBeenCalled();
  });
});
