import { describe, it, expect } from 'vitest';
import {
  currentTarget,
  promptText,
  hotspotRole,
  hotspotClass,
  revealRole,
  revealClass,
} from './pictureClickModel';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, over: Partial<AnswerRecord> = {}): AnswerRecord =>
  ({
    id,
    promptKind: 'REGION',
    promptValue: id,
    display: id.toUpperCase(),
    ...over,
  }) as AnswerRecord;

const answers = [mk('nw'), mk('ne'), mk('sw'), mk('se')];

describe('currentTarget', () => {
  it('is the first REGION answer not yet found', () => {
    expect(currentTarget(answers, new Set())?.id).toBe('nw');
    expect(currentTarget(answers, new Set(['nw']))?.id).toBe('ne');
    expect(currentTarget(answers, new Set(['nw', 'ne', 'sw']))?.id).toBe('se');
  });

  it('is null once every region is found', () => {
    expect(currentTarget(answers, new Set(['nw', 'ne', 'sw', 'se']))).toBeNull();
  });

  it('ignores non-REGION answers', () => {
    const mixed = [mk('x', { promptKind: 'NONE' }), mk('nw')];
    expect(currentTarget(mixed, new Set())?.id).toBe('nw');
  });
});

describe('promptText', () => {
  it('uses the target hint when present', () => {
    expect(promptText(mk('nw', { hint: 'Click NW' }))).toBe('Click NW');
  });

  it('falls back to "Click <display>" without a hint', () => {
    expect(promptText(mk('nw', { hint: null }))).toBe('Click NW');
  });

  it('announces completion when there is no target', () => {
    expect(promptText(null)).toBe('All regions found!');
  });
});

describe('hotspotRole', () => {
  const target = mk('ne');
  it('marks found answers found', () => {
    expect(hotspotRole(mk('nw'), new Set(['nw']), target)).toBe('found');
  });
  it('marks the active target target', () => {
    expect(hotspotRole(mk('ne'), new Set(), target)).toBe('target');
  });
  it('marks other unfound answers idle', () => {
    expect(hotspotRole(mk('sw'), new Set(), target)).toBe('idle');
    expect(hotspotRole(mk('sw'), new Set(), null)).toBe('idle');
  });
});

describe('hotspotClass', () => {
  it('composes the base + role modifier class', () => {
    expect(hotspotClass('found')).toBe('pc-hotspot pc-hotspot--found');
    expect(hotspotClass('target')).toBe('pc-hotspot pc-hotspot--target');
    expect(hotspotClass('idle')).toBe('pc-hotspot pc-hotspot--idle');
  });
});

describe('revealRole', () => {
  it('flags a hotspot as found or missed', () => {
    expect(revealRole(mk('nw'), new Set(['nw']))).toBe('found');
    expect(revealRole(mk('ne'), new Set(['nw']))).toBe('missed');
  });
});

describe('revealClass', () => {
  it('composes the reveal class with found/missed modifier', () => {
    expect(revealClass('found')).toBe('pc-hotspot pc-hotspot--reveal pc-hotspot--reveal-found');
    expect(revealClass('missed')).toBe('pc-hotspot pc-hotspot--reveal pc-hotspot--reveal-missed');
  });
});
