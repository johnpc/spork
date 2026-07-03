import { describe, it, expect } from 'vitest';
import { DAILY_GAMES } from './dailyGames';

describe('DAILY_GAMES', () => {
  it('routes quiz-type games into the quiz play screen + gates per type', () => {
    expect(DAILY_GAMES.worldle.playPath('x')).toBe('/quizzes/x/play');
    expect(DAILY_GAMES.worldle.dailyKey).toBe('quizzes:MAP');
    expect(DAILY_GAMES['in-order'].dailyKey).toBe('quizzes:ORDER_UP');
    expect(DAILY_GAMES['picture-this'].playPath('y')).toBe('/quizzes/y/play');
  });

  it('routes each standalone island into its own play screen', () => {
    expect(DAILY_GAMES.steps.playPath('x')).toBe('/steps/x');
    expect(DAILY_GAMES.acrostic.playPath('x')).toBe('/acrostic/x');
    expect(DAILY_GAMES.quizzle.playPath('x')).toBe('/quizzle/x');
    expect(DAILY_GAMES.chess.playPath('x')).toBe('/chess/x');
    expect(DAILY_GAMES.chess.dailyKey).toBe('chess');
  });

  it('names each game for the recap and covers 9 quiz types + 4 islands', () => {
    expect(DAILY_GAMES.chess.name).toBe('Chess Attack');
    expect(DAILY_GAMES.worldle.name).toBe('Worldle');
    // 9 quiz types + steps/acrostic/quizzle/chess (Flashcards isn't daily-gated).
    expect(Object.keys(DAILY_GAMES)).toHaveLength(13);
  });
});
