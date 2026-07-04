import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BeeReveal } from './BeeReveal';

describe('BeeReveal', () => {
  it('shows the count of found vs total words', () => {
    render(<BeeReveal answers={['abc', 'def', 'ghi']} found={['abc']} pangrams={[]} />);
    expect(screen.getByTestId('bee-reveal')).toHaveTextContent('You found 1 of 3 words');
  });

  it('lists missed words (excluding found)', () => {
    render(<BeeReveal answers={['abc', 'def', 'ghi']} found={['abc']} pangrams={[]} />);
    const missed = screen.getByTestId('bee-reveal-missed');
    expect(missed).toBeInTheDocument();
    expect(missed).toHaveTextContent('DEF');
    expect(missed).toHaveTextContent('GHI');
    expect(missed).not.toHaveTextContent('ABC');
  });

  it('calls out missed pangrams separately', () => {
    render(
      <BeeReveal
        answers={['abc', 'def', 'pangram', 'xyz']}
        found={['abc']}
        pangrams={['pangram']}
      />,
    );
    const pangramSection = screen.getByTestId('bee-reveal-pangrams');
    expect(pangramSection).toBeInTheDocument();
    expect(pangramSection).toHaveTextContent('PANGRAM');
    const missedSection = screen.getByTestId('bee-reveal-missed');
    expect(missedSection).toHaveTextContent('DEF');
    expect(missedSection).toHaveTextContent('XYZ');
    expect(missedSection).not.toHaveTextContent('PANGRAM');
  });

  it('does not show pangrams section if all pangrams were found', () => {
    render(
      <BeeReveal
        answers={['abc', 'pangram', 'xyz']}
        found={['abc', 'pangram']}
        pangrams={['pangram']}
      />,
    );
    expect(screen.queryByTestId('bee-reveal-pangrams')).not.toBeInTheDocument();
    expect(screen.getByTestId('bee-reveal-missed')).toHaveTextContent('XYZ');
  });

  it('renders with role=status for accessibility', () => {
    render(<BeeReveal answers={['abc', 'def']} found={['abc']} pangrams={[]} />);
    expect(screen.getByTestId('bee-reveal')).toHaveAttribute('role', 'status');
  });

  it('shows no missed words if all found', () => {
    render(<BeeReveal answers={['abc', 'def']} found={['abc', 'def']} pangrams={[]} />);
    expect(screen.queryByTestId('bee-reveal-missed')).not.toBeInTheDocument();
    expect(screen.getByTestId('bee-reveal')).toHaveTextContent('You found 2 of 2 words');
  });
});
