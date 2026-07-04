import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StepsSolution } from './StepsSolution';

describe('StepsSolution', () => {
  it('renders the full par path in order', () => {
    const parPath = ['cat', 'cot', 'cog', 'dog'];
    render(<StepsSolution parPath={parPath} />);
    const solution = screen.getByTestId('steps-solution');
    expect(solution).toHaveTextContent('CAT');
    expect(solution).toHaveTextContent('COT');
    expect(solution).toHaveTextContent('COG');
    expect(solution).toHaveTextContent('DOG');
  });

  it('has role="status" for screen readers', () => {
    render(<StepsSolution parPath={['cat', 'dog']} />);
    expect(screen.getByTestId('steps-solution')).toHaveAttribute('role', 'status');
  });

  it('labels as one valid answer (not THE answer)', () => {
    render(<StepsSolution parPath={['cold', 'warm']} />);
    expect(screen.getByTestId('steps-solution')).toHaveTextContent(/One valid solution/i);
  });
});
