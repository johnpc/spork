import { describe, it, expect } from 'vitest';
import { modeHint } from './modeHint';
import type { QuizMode } from './renderers';

const MODES: QuizMode[] = [
  'CLASSIC',
  'MAP',
  'PICTURE_BOX',
  'MULTIPLE_CHOICE',
  'CLICKABLE',
  'PICTURE_CLICK',
  'SLIDESHOW',
  'SORTABLE',
  'ORDER_UP',
];

describe('modeHint', () => {
  it('returns a non-empty hint for every supported quiz mode', () => {
    for (const mode of MODES) {
      expect(modeHint(mode).length).toBeGreaterThan(0);
    }
  });

  it('describes the tap interaction for the arrange modes', () => {
    expect(modeHint('SORTABLE')).toMatch(/tap/i);
    expect(modeHint('ORDER_UP')).toMatch(/order/i);
  });

  it('returns empty string for an undefined mode', () => {
    expect(modeHint(undefined)).toBe('');
  });
});
