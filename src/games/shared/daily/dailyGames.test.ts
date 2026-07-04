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

  it('names each game for the recap and covers 11 quiz types + 4 islands', () => {
    expect(DAILY_GAMES.chess.name).toBe('Chess Attack');
    expect(DAILY_GAMES.worldle.name).toBe('Worldle');
    expect(DAILY_GAMES['state-capitals'].name).toBe('State Capitals');
    // 11 quiz types (incl. World/State Capitals) + steps/acrostic/quizzle/chess
    // (Flashcards isn't daily-gated).
    expect(Object.keys(DAILY_GAMES)).toHaveLength(15);
  });

  it('gives topic-filtered games a topic-scoped daily key (distinct from plain Slideshow)', () => {
    expect(DAILY_GAMES.slideshow.dailyKey).toBe('quizzes:SLIDESHOW');
    expect(DAILY_GAMES['world-capitals'].dailyKey).toBe('quizzes:SLIDESHOW:World Capitals');
    expect(DAILY_GAMES['state-capitals'].dailyKey).toBe('quizzes:SLIDESHOW:US State Capitals');
  });
});
