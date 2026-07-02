import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuoteReveal } from './QuoteReveal';

describe('QuoteReveal', () => {
  it('renders the revealed words', () => {
    render(<QuoteReveal words={['Do', 'or', '__']} author={null} />);
    expect(screen.getByTestId('quote')).toHaveTextContent('Do or __');
    expect(screen.queryByTestId('quote-author')).not.toBeInTheDocument();
  });

  it('shows the author when provided', () => {
    render(<QuoteReveal words={['Do', 'or', 'do', 'not']} author="Yoda" />);
    expect(screen.getByTestId('quote-author')).toHaveTextContent('Yoda');
  });
});
