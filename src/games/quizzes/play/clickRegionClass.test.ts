import { describe, it, expect } from 'vitest';
import { clickRegionClass } from './clickRegionClass';

const map = new Map([['566', 'a']]);

describe('clickRegionClass', () => {
  it('is inert for a country not in the quiz', () => {
    expect(clickRegionClass('999', new Set(), map, null)).toBe('sp-region sp-region--inert');
  });
  it('is found once its answer is in the found set', () => {
    expect(clickRegionClass('566', new Set(['a']), map, null)).toBe('sp-region sp-region--found');
  });
  it('flashes wrong when it is the wrongly-clicked region', () => {
    expect(clickRegionClass('566', new Set(), map, 'a')).toBe('sp-region sp-region--wrong');
  });
  it('is blank while playing and revealed on give-up', () => {
    expect(clickRegionClass('566', new Set(), map, null)).toBe('sp-region sp-region--blank');
    expect(clickRegionClass('566', new Set(), map, null, true)).toBe(
      'sp-region sp-region--revealed',
    );
  });
});
