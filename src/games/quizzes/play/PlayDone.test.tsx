import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PlayDone } from './PlayDone';

const renderDone = (props: Parameters<typeof PlayDone>[0]) =>
  render(
    <MemoryRouter>
      <PlayDone {...props} />
    </MemoryRouter>,
  );

describe('PlayDone', () => {
  it('shows the final score + percent and links back to the games home', () => {
    renderDone({ found: 3, total: 4 });
    expect(screen.getByTestId('play-final-score')).toHaveTextContent('3 / 4');
    expect(screen.getByText(/75% found/)).toBeInTheDocument();
    expect(screen.getByTestId('play-home')).toHaveAttribute('href', '/home');
  });

  it('appends the time taken when provided', () => {
    renderDone({ found: 3, total: 4, timeSeconds: 65 });
    expect(screen.getByText(/75% found · 1:05/)).toBeInTheDocument();
  });
});
