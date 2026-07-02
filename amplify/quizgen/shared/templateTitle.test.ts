import { describe, it, expect } from 'vitest';
import { titleFor } from './templateTitle';

describe('titleFor', () => {
  it('title-cases a hyphenated slug', () => {
    expect(titleFor('world-countries')).toBe('World Countries');
  });
  it('handles a single word', () => {
    expect(titleFor('flags')).toBe('Flags');
  });
});
