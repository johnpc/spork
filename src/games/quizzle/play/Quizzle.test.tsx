import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useQuizzle', () => ({ useQuizzle: () => hook.state }));

import { Quizzle } from './Quizzle';

const renderQuizzle = () =>
  render(
    <MemoryRouter initialEntries={['/quizzle/q1']}>
      <Quizzle />
    </MemoryRouter>,
  );

const base = {
  quizzle: { id: 'q1' },
  isLoading: false,
  topic: 'Capitals',
  total: 2,
  question: { question: 'Capital of France?', answer: 'Paris' },
  bank: 1000,
  startingBank: 1000,
  stage: 'wager',
  wagerAmount: 1,
  lastCorrect: null,
  lastAnswer: null,
  index: 0,
  best: null,
  start: vi.fn(),
  wager: vi.fn(),
  answer: vi.fn(),
  advance: vi.fn(),
};

describe('Quizzle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the start button before the session starts', () => {
    hook.state = { ...base, started: false, done: false };
    renderQuizzle();
    expect(screen.getByTestId('quizzle-topic')).toHaveTextContent('Capitals');
    expect(screen.getByTestId('quizzle-start')).toBeInTheDocument();
  });

  it('shows the current round once started', () => {
    hook.state = { ...base, started: true, done: false };
    renderQuizzle();
    expect(screen.getByTestId('quizzle-question')).toHaveTextContent('France');
    expect(screen.getByTestId('quizzle-bank')).toHaveTextContent('1000');
  });

  it('shows the done screen when finished', () => {
    hook.state = { ...base, started: true, done: true, bank: 1500 };
    renderQuizzle();
    expect(screen.getByTestId('quizzle-done')).toBeInTheDocument();
  });

  it('shows unavailable when the quizzle is missing', () => {
    hook.state = { ...base, quizzle: null, started: false, done: false };
    renderQuizzle();
    expect(screen.getByTestId('quizzle-unavailable')).toBeInTheDocument();
  });
});
