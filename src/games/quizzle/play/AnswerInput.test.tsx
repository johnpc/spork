import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnswerInput } from './AnswerInput';

describe('AnswerInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the typed guess', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput onAnswer={onAnswer} />);
    fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'Paris' } });
    fireEvent.click(screen.getByTestId('answer-submit'));
    expect(onAnswer).toHaveBeenCalledWith('Paris');
  });

  it('ignores an empty submit', () => {
    const onAnswer = vi.fn();
    render(<AnswerInput onAnswer={onAnswer} />);
    fireEvent.click(screen.getByTestId('answer-submit'));
    expect(onAnswer).not.toHaveBeenCalled();
  });
});
