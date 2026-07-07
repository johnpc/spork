import { describe, it, expect } from 'vitest';
import { dotRole } from './mapDots';

const regionToAnswer = new Map([
  ['442', 'a1'], // Luxembourg → answer a1
]);

describe('dotRole', () => {
  it('mirrors the found role of its region', () => {
    expect(dotRole('442', new Set(['a1']), regionToAnswer)).toBe('sp-dot sp-dot--found');
  });

  it('is blank while running and unfound', () => {
    expect(dotRole('442', new Set(), regionToAnswer)).toBe('sp-dot sp-dot--blank');
  });

  it('is revealed on give-up when unfound', () => {
    expect(dotRole('442', new Set(), regionToAnswer, null, true)).toBe('sp-dot sp-dot--revealed');
  });

  it('flashes wrong when its answer was mis-clicked', () => {
    expect(dotRole('442', new Set(), regionToAnswer, 'a1')).toBe('sp-dot sp-dot--wrong');
  });

  it('is inert for a region not in the quiz', () => {
    expect(dotRole('999', new Set(), regionToAnswer)).toBe('sp-dot sp-dot--inert');
  });
});
