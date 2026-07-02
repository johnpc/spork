import { describe, it, expect } from 'vitest';
import { axesFor } from './modeAxes';

describe('axesFor', () => {
  it('maps membership typed modes', () => {
    expect(axesFor('CLASSIC')).toEqual({ inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' });
    expect(axesFor('MAP')).toEqual({ inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' });
  });
  it('maps the special scoring modes', () => {
    expect(axesFor('SORTABLE')).toEqual({ inputMode: 'ARRANGE', scoringMode: 'BUCKETING' });
    expect(axesFor('ORDER_UP')).toEqual({ inputMode: 'ARRANGE', scoringMode: 'SEQUENCE' });
    expect(axesFor('MULTIPLE_CHOICE').inputMode).toBe('PICK');
    expect(axesFor('CLICKABLE').inputMode).toBe('CLICK');
  });
  it('throws on an unknown mode', () => {
    expect(() => axesFor('NOPE')).toThrow(/unknown quiz mode/);
  });
});
