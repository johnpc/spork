import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ComeBackTomorrow } from './ComeBackTomorrow';

describe('ComeBackTomorrow', () => {
  it('recaps the score (+ time) and links home', () => {
    render(
      <MemoryRouter>
        <ComeBackTomorrow game="Quizzes" score={6} total={8} timeSeconds={45} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('come-back')).toBeInTheDocument();
    expect(screen.getByTestId('come-back-score')).toHaveTextContent('6 / 8 · 45s');
    expect(screen.getByTestId('come-back-home')).toHaveAttribute('href', '/home');
  });

  it('omits time when not provided', () => {
    render(
      <MemoryRouter>
        <ComeBackTomorrow game="Chess Attack" score={1} total={1} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('come-back-score')).toHaveTextContent('1 / 1');
    expect(screen.getByTestId('come-back-score')).not.toHaveTextContent('s');
  });
});
