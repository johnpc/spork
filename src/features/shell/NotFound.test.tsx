import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('shows a friendly dead-end linking home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('not-found')).toHaveTextContent('Nothing here');
    expect(screen.getByTestId('not-found-home')).toHaveAttribute('href', '/home');
  });
});
