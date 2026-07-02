import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const admin = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useQuizAdmin', () => ({ useQuizAdmin: () => admin.state }));
vi.mock('./GenerateQuizForm', () => ({ GenerateQuizForm: () => <div data-testid="gen-form" /> }));

import { QuizAdmin } from './QuizAdmin';

describe('QuizAdmin', () => {
  it('renders the generate form, runs, and drafts sections', () => {
    admin.state = {
      runs: [{ id: 'r1', topic: 'X', status: 'DRAFT_READY' }],
      drafts: [{ id: 'q1', topic: 'X', mode: 'CLASSIC', answerCount: 8 }],
      generate: vi.fn(),
      publish: vi.fn(),
      publishingId: null,
    };
    render(<QuizAdmin />);
    expect(screen.getByTestId('gen-form')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-runs')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-drafts')).toBeInTheDocument();
  });
});
