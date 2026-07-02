import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LadderPath } from './LadderPath';

describe('LadderPath', () => {
  it('renders each word uppercased and marks the target', () => {
    render(<LadderPath path={['cat', 'cot', 'dog']} target="dog" />);
    const words = screen.getAllByTestId('ladder-word');
    expect(words.map((w) => w.textContent)).toEqual(['CAT', 'COT', 'DOG']);
    expect(words[2].className).toContain('ladder-path__word--target');
    expect(words[0].className).not.toContain('--target');
  });
});
