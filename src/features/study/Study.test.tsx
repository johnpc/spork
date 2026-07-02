import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type StudyState = ReturnType<typeof base>;
const base = () => ({
  isAuthenticated: true,
  isLoading: false,
  current: null as null | { card: { id: string; front: string; back: string } },
  choices: null as null | { answer: string; options: string[] },
  picked: null as string | null,
  answer: vi.fn(),
  next: vi.fn(),
  done: false,
  reset: vi.fn(),
  score: { correct: 0, total: 0 },
  direction: 'front' as 'front' | 'back',
  toggleDirection: vi.fn(),
  position: { index: 0, total: 0 },
});
const hook = vi.hoisted(() => ({ value: {} as StudyState }));
vi.mock('./useStudy', () => ({ useStudy: () => hook.value }));
vi.mock('./StudyCard', () => ({ StudyCard: () => <div data-testid="study-card" /> }));

import { Study } from './Study';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/decks/d1/study']}>
      <Route path="/decks/:id/study">
        <Study />
      </Route>
    </MemoryRouter>,
  );
}

describe('Study', () => {
  beforeEach(() => {
    hook.value = base();
  });

  it('prompts sign-in when signed out', () => {
    hook.value = { ...base(), isAuthenticated: false };
    renderAt();
    expect(screen.getByTestId('study-signed-out')).toBeInTheDocument();
  });

  it('renders the current card with progress', () => {
    hook.value = {
      ...base(),
      current: { card: { id: 'c1', front: 'a', back: 'A' } },
      choices: { answer: 'A', options: ['A', 'B'] },
      position: { index: 0, total: 3 },
    };
    renderAt();
    expect(screen.getByTestId('study-card')).toBeInTheDocument();
    expect(screen.getByTestId('study-progress')).toHaveTextContent('1 / 3');
  });

  it('shows the all-caught-up state when there is no current card', () => {
    hook.value = { ...base(), current: null, position: { index: 0, total: 0 } };
    renderAt();
    expect(screen.getByTestId('study-done')).toBeInTheDocument();
    expect(screen.queryByTestId('study-score')).not.toBeInTheDocument();
  });

  it('shows the session score when cards were answered', () => {
    hook.value = { ...base(), current: null, score: { correct: 3, total: 4 } };
    renderAt();
    expect(screen.getByText('You got 3 of 4 correct.')).toBeInTheDocument();
    expect(screen.getByTestId('study-score')).toHaveTextContent('75%');
  });
});
