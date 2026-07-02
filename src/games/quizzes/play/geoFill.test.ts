import { describe, it, expect } from 'vitest';
import { regionClass, regionAnswerMap } from './geoFill';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'br', promptKind: 'REGION', promptValue: '076' },
  { id: 'us', promptKind: 'REGION', promptValue: '840' },
  { id: 'x', promptKind: 'TEXT', promptValue: 'clue' }, // non-region: ignored
] as AnswerRecord[];

describe('regionAnswerMap', () => {
  it('maps REGION promptValues to answer ids, ignoring other kinds', () => {
    const map = regionAnswerMap(answers);
    expect(map.get('076')).toBe('br');
    expect(map.get('840')).toBe('us');
    expect(map.size).toBe(2);
  });
});

describe('regionClass', () => {
  const map = regionAnswerMap(answers);

  it('marks a region found when its answer id is in the found set', () => {
    expect(regionClass('076', new Set(['br']), map)).toBe('sp-region sp-region--found');
  });
  it('marks a mapped-but-unfound region blank', () => {
    expect(regionClass('840', new Set(['br']), map)).toBe('sp-region sp-region--blank');
  });
  it('marks an unmapped region inert', () => {
    expect(regionClass('999', new Set(), map)).toBe('sp-region sp-region--inert');
  });
  it('coerces a numeric id to string and matches an exact key', () => {
    const numMap = regionAnswerMap([
      { id: 'z', promptKind: 'REGION', promptValue: '4' },
    ] as AnswerRecord[]);
    expect(regionClass(4, new Set(['z']), numMap)).toBe('sp-region sp-region--found');
  });
  it('treats undefined region id as inert', () => {
    expect(regionClass(undefined, new Set(), map)).toBe('sp-region sp-region--inert');
  });
});
