import { describe, it, expect } from 'vitest';
import { buildMapAnswers, type TopologyRegion, type IsoResolvers } from './buildMapAnswers';

// A tiny fake ISO table keyed by numeric id — mirrors i18n-iso-countries.
const TABLE: Record<string, { names: string[]; a2: string; a3: string }> = {
  '840': { names: ['United States of America', 'United States', 'USA'], a2: 'US', a3: 'USA' },
  '076': { names: ['Brazil'], a2: 'BR', a3: 'BRA' },
};

const iso: IsoResolvers = {
  namesForNumeric: (n) => TABLE[n]?.names ?? [],
  alpha2ForNumeric: (n) => TABLE[n]?.a2 ?? null,
  alpha3ForNumeric: (n) => TABLE[n]?.a3 ?? null,
};

const regions: TopologyRegion[] = [
  { id: '840', name: 'United States of America' },
  { id: '076', name: 'Brazil' },
];

describe('buildMapAnswers', () => {
  it('builds one ordered REGION answer per keyed region', () => {
    const out = buildMapAnswers(regions, iso, {});
    expect(out).toHaveLength(2);
    expect(out.map((a) => a.ord)).toEqual([0, 1]);
    expect(out.map((a) => a.promptValue)).toEqual(['840', '076']);
    expect(out.every((a) => a.promptKind === 'REGION')).toBe(true);
  });

  it('prefers the topology label for display', () => {
    const out = buildMapAnswers([{ id: '840', name: 'USA (map label)' }], iso, {});
    expect(out[0].display).toBe('USA (map label)');
  });

  it('unions ISO names, alpha-2/3, and curated overrides into accepted', () => {
    const out = buildMapAnswers([{ id: '840', name: 'United States of America' }], iso, {
      US: ['America'],
    });
    expect(out[0].accepted).toEqual([
      'United States of America',
      'United States',
      'USA',
      'US',
      'America',
    ]);
  });

  it('dedupes accepted case-insensitively, keeping first-seen order', () => {
    const dupeIso: IsoResolvers = {
      namesForNumeric: () => ['Brazil', 'brazil', 'BRAZIL'],
      alpha2ForNumeric: () => 'BR',
      alpha3ForNumeric: () => 'BRA',
    };
    const out = buildMapAnswers([{ id: '076', name: 'Brazil' }], dupeIso, {});
    expect(out[0].accepted).toEqual(['Brazil', 'BR', 'BRA']);
  });

  it('skips regions with no numeric id (unkeyed disputed territories)', () => {
    const out = buildMapAnswers([{ id: '', name: 'Somaliland' }, ...regions], iso, {});
    expect(out.map((a) => a.promptValue)).toEqual(['840', '076']);
  });

  it('falls back to ISO name then id when the topology label is empty', () => {
    const out = buildMapAnswers([{ id: '076', name: '' }], iso, {});
    expect(out[0].display).toBe('Brazil');
  });
});
