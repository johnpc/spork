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
    expect(DAILY_GAMES.wordle.playPath('x')).toBe('/wordle/x');
    expect(DAILY_GAMES.connections.playPath('x')).toBe('/connections/x');
    expect(DAILY_GAMES.spellingbee.playPath('x')).toBe('/spellingbee/x');
  });

  it('names each game for the recap and covers 12 quiz types + 7 islands', () => {
    expect(DAILY_GAMES.chess.name).toBe('Chess Attack');
    expect(DAILY_GAMES.worldle.name).toBe('Worldle');
    expect(DAILY_GAMES['state-capitals'].name).toBe('State Capitals');
    expect(DAILY_GAMES.wordle.name).toBe('Wordle');
    expect(DAILY_GAMES.connections.name).toBe('Connections');
    expect(DAILY_GAMES.spellingbee.name).toBe('Spelling Bee');
    // 12 quiz types (incl. capitals + find-the-state) + steps/acrostic/quizzle/
    // chess/wordle/connections/spellingbee (Flashcards isn't daily-gated).
    expect(Object.keys(DAILY_GAMES)).toHaveLength(19);
  });

  it('gives topic-filtered games a topic-scoped daily key (distinct from plain Slideshow)', () => {
    expect(DAILY_GAMES.slideshow.dailyKey).toBe('quizzes:SLIDESHOW');
    expect(DAILY_GAMES['world-capitals'].dailyKey).toBe('quizzes:SLIDESHOW:World Capitals');
    expect(DAILY_GAMES['state-capitals'].dailyKey).toBe('quizzes:SLIDESHOW:US State Capitals');
  });
});
