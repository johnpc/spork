import { describe, it, expect } from 'vitest';
import { tapAction } from './tapAction';

describe('tapAction', () => {
  it('selects an own piece when nothing is selected (ignores others)', () => {
    expect(tapAction('e8', null, true)).toEqual({ kind: 'select', sq: 'e8' });
    expect(tapAction('d4', null, false)).toEqual({ kind: 'ignore' });
  });
  it('deselects when tapping the selected square', () => {
    expect(tapAction('e8', 'e8', true)).toEqual({ kind: 'deselect' });
  });
  it('reselects a different own piece', () => {
    expect(tapAction('a8', 'e8', true)).toEqual({ kind: 'select', sq: 'a8' });
  });
  it('moves to an empty/enemy square when one is selected', () => {
    expect(tapAction('e1', 'e8', false)).toEqual({ kind: 'move', from: 'e8', to: 'e1' });
  });
});
