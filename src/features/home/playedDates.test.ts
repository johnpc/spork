import { describe, expect, it } from 'vitest';
import { allKeys, playedDatesFrom } from './playedDates';

describe('playedDatesFrom', () => {
  it('collects the distinct dates from daily keys, ignoring others', () => {
    const dates = playedDatesFrom([
      'spork.daily.quizzes:MAP.2026-07-03',
      'spork.daily.steps.2026-07-03', // same day, different game → one date
      'spork.daily.chess.2026-07-02',
      'some.other.key',
      'spork.daily.malformed',
    ]);
    expect([...dates].sort()).toEqual(['2026-07-02', '2026-07-03']);
  });

  it('parses the date from the end so game names with dots still work', () => {
    const dates = playedDatesFrom(['spork.daily.quizzes:MULTIPLE_CHOICE.2026-01-09']);
    expect(dates.has('2026-01-09')).toBe(true);
  });

  it('is empty for no matching keys', () => {
    expect(playedDatesFrom(['x', 'y']).size).toBe(0);
  });
});

describe('allKeys', () => {
  it('reads every key from a Storage-like object', () => {
    const store = {
      length: 2,
      key: (i: number) => ['a', 'b'][i] ?? null,
    };
    expect(allKeys(store)).toEqual(['a', 'b']);
  });
});
