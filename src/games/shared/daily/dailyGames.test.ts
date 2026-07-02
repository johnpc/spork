import { describe, it, expect } from 'vitest';
import { DAILY_GAMES } from './dailyGames';

describe('DAILY_GAMES', () => {
  it('builds each game’s play path from an id', () => {
    expect(DAILY_GAMES.quizzes.playPath('x')).toBe('/quizzes/x/play');
    expect(DAILY_GAMES.steps.playPath('x')).toBe('/steps/x');
    expect(DAILY_GAMES.acrostic.playPath('x')).toBe('/acrostic/x');
    expect(DAILY_GAMES.quizzle.playPath('x')).toBe('/quizzle/x');
    expect(DAILY_GAMES.chess.playPath('x')).toBe('/chess/x');
  });

  it('names each game for the recap', () => {
    expect(DAILY_GAMES.chess.name).toBe('Chess Attack');
    expect(Object.keys(DAILY_GAMES)).toHaveLength(5);
  });
});
