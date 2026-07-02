import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { QuizRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({ state: {} as { quizzes: QuizRecord[]; isLoading: boolean } }));
vi.mock('./useQuizzes', () => ({ useQuizzes: () => hook.state }));

import { QuizList } from './QuizList';

const renderList = () =>
  render(
    <MemoryRouter>
      <QuizList />
    </MemoryRouter>,
  );

describe('QuizList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists quizzes with a link into play', () => {
    hook.state = {
      isLoading: false,
      quizzes: [{ id: 'q1', topic: 'Countries', mode: 'MAP', answerCount: 195 } as QuizRecord],
    };
    renderList();
    const link = screen.getByTestId('quiz-link');
    expect(link).toHaveAttribute('href', '/quizzes/q1/play');
    expect(link).toHaveTextContent('Countries');
    expect(link).toHaveTextContent('195 answers');
  });

  it('shows an empty message when there are no quizzes', () => {
    hook.state = { isLoading: false, quizzes: [] };
    renderList();
    expect(screen.getByTestId('quizzes-empty')).toBeInTheDocument();
  });
});
