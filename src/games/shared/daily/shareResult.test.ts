import { describe, expect, it } from 'vitest';
import { buildShareText, mmss, scoreBar } from './shareResult';

describe('mmss', () => {
  it('formats sub-minute and multi-minute durations', () => {
    expect(mmss(5)).toBe('0:05');
    expect(mmss(65)).toBe('1:05');
    expect(mmss(600)).toBe('10:00');
  });
  it('floors fractional and clamps negatives to 0:00', () => {
    expect(mmss(9.9)).toBe('0:09');
    expect(mmss(-3)).toBe('0:00');
  });
});

describe('scoreBar', () => {
  it('is all green on a perfect score', () => {
    expect(scoreBar(5, 5)).toBe('🟩🟩🟩🟩🟩');
  });
  it('mixes green and blank proportionally', () => {
    expect(scoreBar(2, 4)).toBe('🟩🟩⬜⬜');
  });
  it('caps at 10 cells for large totals', () => {
    expect(scoreBar(50, 100)).toBe('🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜');
  });
  it('returns empty string for a zero total', () => {
    expect(scoreBar(0, 0)).toBe('');
  });
});

describe('buildShareText', () => {
  it('includes game, date, score, bar and site', () => {
    const text = buildShareText({ game: 'Worldle', score: 3, total: 5, date: '2026-07-03' });
    expect(text).toBe('Spork Worldle · 2026-07-03\n3/5\n🟩🟩🟩⬜⬜\nspork.jpc.io');
  });
  it('appends formatted time when provided', () => {
    const text = buildShareText({
      game: 'Steps',
      score: 1,
      total: 1,
      timeSeconds: 95,
      date: '2026-07-03',
    });
    expect(text).toContain('1/1 · 1:35');
  });
});
