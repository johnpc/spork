import { describe, it, expect } from 'vitest';
import { dailyPathForKey, ALL_GAMES } from './gameCatalog';

describe('dailyPathForKey', () => {
  it('maps a quiz mode key to its /daily slug', () => {
    expect(dailyPathForKey('quizzes:MAP')).toBe('/daily/worldle');
    expect(dailyPathForKey('quizzes:ORDER_UP')).toBe('/daily/in-order');
    expect(dailyPathForKey('quizzes:MULTIPLE_CHOICE')).toBe('/daily/multiple-choice');
  });

  it('maps a standalone island key to its /daily slug', () => {
    expect(dailyPathForKey('chess')).toBe('/daily/chess');
    expect(dailyPathForKey('acrostic')).toBe('/daily/acrostic');
  });

  it('falls back to /home for an unknown key', () => {
    expect(dailyPathForKey('quizzes:NOPE')).toBe('/home');
    expect(dailyPathForKey('mystery')).toBe('/home');
  });

  it('every quiz-type key resolves to a real catalog slug', () => {
    for (const g of ALL_GAMES.filter((x) => x.quizMode)) {
      expect(dailyPathForKey(`quizzes:${g.quizMode}`)).toBe(`/daily/${g.slug}`);
    }
  });
});
