import { describe, it, expect } from 'vitest';
import { scoreGuess, isWin, isGameOver } from './scoring';

describe('scoreGuess', () => {
  it('marks all correct when guess matches answer', () => {
    const results = scoreGuess('crane', 'crane');
    expect(results).toEqual([
      { letter: 'c', result: 'correct' },
      { letter: 'r', result: 'correct' },
      { letter: 'a', result: 'correct' },
      { letter: 'n', result: 'correct' },
      { letter: 'e', result: 'correct' },
    ]);
  });

  it('marks present when letter is in word but wrong position', () => {
    const results = scoreGuess('react', 'crane');
    // r: pos 0 in react, pos 1 in crane → present
    // e: pos 1 in react, pos 4 in crane → present
    // a: pos 2 in react, pos 2 in crane → correct
    // c: pos 3 in react, pos 0 in crane → present
    expect(results[0]).toEqual({ letter: 'r', result: 'present' });
    expect(results[1]).toEqual({ letter: 'e', result: 'present' });
  });

  it('marks absent when letter not in answer', () => {
    const results = scoreGuess('hello', 'crane');
    // hello vs crane: e is in both (pos 1 in hello, pos 4 in crane) → present
    // All others absent
    expect(results.filter((r) => r.result === 'absent').length).toBe(4);
    expect(results[1]).toEqual({ letter: 'e', result: 'present' });
  });

  it('handles duplicate letters (two E in guess, one E in answer)', () => {
    const results = scoreGuess('speed', 'crane');
    // No E in correct position, one E in answer → only one E should be present
    const eResults = results.filter((r) => r.letter === 'e');
    const presentCount = eResults.filter((r) => r.result === 'present').length;
    expect(presentCount).toBe(1);
  });

  it('handles duplicate letters (green takes precedence)', () => {
    const results = scoreGuess('alley', 'aloft');
    // First L is correct (pos 1), second L is absent (only one L in answer, used by green)
    expect(results[1]).toEqual({ letter: 'l', result: 'correct' });
    expect(results[2]).toEqual({ letter: 'l', result: 'absent' });
  });

  it('handles multiple duplicates correctly', () => {
    const results = scoreGuess('llama', 'label');
    // Two L in answer: first L correct (pos 0), second L correct (pos 2)
    expect(results[0]).toEqual({ letter: 'l', result: 'correct' });
    expect(results[1]).toEqual({ letter: 'l', result: 'present' });
    expect(results[2].letter).toBe('a');
  });
});

describe('isWin', () => {
  it('true when all tiles are correct', () => {
    const results = scoreGuess('crane', 'crane');
    expect(isWin(results)).toBe(true);
  });

  it('false when any tile is not correct', () => {
    const results = scoreGuess('crape', 'crane');
    expect(isWin(results)).toBe(false);
  });
});

describe('isGameOver', () => {
  it('true when won', () => {
    expect(isGameOver(['crane'], 6, true)).toBe(true);
  });

  it('true when out of guesses', () => {
    expect(isGameOver(['a', 'b', 'c', 'd', 'e', 'f'], 6, false)).toBe(true);
  });

  it('false when guesses remain and not won', () => {
    expect(isGameOver(['crane', 'house'], 6, false)).toBe(false);
  });
});
