import { describe, it, expect } from 'vitest';
import { deriveDailyEntry, shouldPoll } from './dailyEntryState';

const NOW = new Date(2026, 6, 7); // 2026-07-07
const list = [
  { id: 'y', puzzleDate: '2026-07-06' },
  { id: 't', puzzleDate: '2026-07-07' },
];
const base = { hasGame: true, playedToday: false, isSuccess: true, now: NOW };

describe('deriveDailyEntry', () => {
  it('today: picks today lenient, never needs generation', () => {
    const s = deriveDailyEntry({ ...base, day: '2026-07-07', browsing: false, data: list });
    expect(s.todays?.id).toBe('t');
    expect(s.needsGeneration).toBe(false);
    expect(s.emptyBase).toBe(false);
  });

  it('browsing a present past day: exact match, no generation', () => {
    const s = deriveDailyEntry({ ...base, day: '2026-07-06', browsing: true, data: list });
    expect(s.todays?.id).toBe('y');
    expect(s.needsGeneration).toBe(false);
  });

  it('browsing a MISSING past day: needs generation (no lenient fallback)', () => {
    const s = deriveDailyEntry({ ...base, day: '2026-06-01', browsing: true, data: list });
    expect(s.todays).toBeNull();
    expect(s.needsGeneration).toBe(true);
    expect(s.emptyBase).toBe(false);
  });

  it('a future browsed day is empty, not generatable', () => {
    const s = deriveDailyEntry({ ...base, day: '2026-07-09', browsing: true, data: [] });
    expect(s.needsGeneration).toBe(false);
    expect(s.emptyBase).toBe(true);
  });

  it('still loading (no data) resolves nothing', () => {
    const s = deriveDailyEntry({ ...base, day: '2026-07-07', browsing: false, data: undefined, isSuccess: false }); // prettier-ignore
    expect(s.todays).toBeNull();
    expect(s.needsGeneration).toBe(false);
    expect(s.emptyBase).toBe(false);
  });
});

describe('shouldPoll', () => {
  it('polls only while browsing a day whose puzzle is absent', () => {
    expect(shouldPoll(true, true, list, '2026-06-01')).toBe(true); // missing → poll
    expect(shouldPoll(true, true, list, '2026-07-06')).toBe(false); // present → stop
    expect(shouldPoll(false, true, undefined, '2026-07-07')).toBe(false); // today → never
  });
});
