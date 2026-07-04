import { describe, it, expect } from 'vitest';
import { dailyRegionLabel, dailyRegionAnswers } from './dailyRegion';
import { CONTINENT_REGIONS } from './continents';

const REGION_ANSWERS = [
  { promptKind: 'REGION', promptValue: '566' }, // Nigeria (Africa)
  { promptKind: 'REGION', promptValue: '250' }, // France (Europe)
  { promptKind: 'REGION', promptValue: '840' }, // USA (North America)
];

describe('dailyRegionLabel', () => {
  it('returns null for a non-MAP quiz — only Worldle rotates', () => {
    // A CLICKABLE "Find the African Countries" quiz is already region-scoped.
    expect(dailyRegionLabel('CLICKABLE', new Date(Date.UTC(2026, 0, 5, 12)))).toBeNull();
    expect(dailyRegionLabel('SLIDESHOW', new Date(Date.UTC(2026, 0, 5, 12)))).toBeNull();
    expect(dailyRegionLabel(undefined, new Date(Date.UTC(2026, 0, 5, 12)))).toBeNull();
  });

  it('labels a MAP quiz with a continent, cycling by day, with a World finale', () => {
    const labels = new Set<string>();
    for (let i = 0; i < 14; i++) labels.add(dailyRegionLabel('MAP', new Date(Date.UTC(2026, 0, 1 + i, 12))) ?? ''); // prettier-ignore
    expect(labels.has('World')).toBe(true);
    expect([...labels].filter((l) => l !== 'World').length).toBeGreaterThanOrEqual(3);
    for (const l of labels) expect(l === 'World' || l in CONTINENT_REGIONS).toBe(true);
  });

  it('day-number % 7 === 0 is the World finale', () => {
    // 1970-01-01 (day 0) is a finale.
    expect(dailyRegionLabel('MAP', new Date(Date.UTC(1970, 0, 1, 12)))).toBe('World');
  });
});

describe('dailyRegionAnswers', () => {
  it('passes a non-MAP quiz through untouched', () => {
    const now = new Date(Date.UTC(2026, 0, 5, 12));
    expect(dailyRegionAnswers('CLICKABLE', REGION_ANSWERS, now)).toEqual(REGION_ANSWERS);
  });

  it('keeps all answers on the World finale', () => {
    const world = new Date(Date.UTC(1970, 0, 1, 12)); // day 0 → World
    expect(dailyRegionAnswers('MAP', REGION_ANSWERS, world)).toHaveLength(REGION_ANSWERS.length);
  });

  it('narrows a MAP quiz to the day’s continent on a non-finale day', () => {
    let narrowed = REGION_ANSWERS;
    for (let i = 1; i < 7; i++) {
      const r = dailyRegionAnswers('MAP', REGION_ANSWERS, new Date(Date.UTC(1970, 0, 1 + i, 12)));
      if (r.length < REGION_ANSWERS.length) {
        narrowed = r;
        break;
      }
    }
    expect(narrowed.length).toBeLessThan(REGION_ANSWERS.length);
  });
});
