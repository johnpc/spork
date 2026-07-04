/**
 * Pure Wordle engine. Two-pass algorithm: greens first, then yellows only for
 * remaining unused answer letters. Duplicate handling is the classic Wordle
 * rule: each answer letter can satisfy at most one guess letter (prefer green
 * over yellow). All pure + deterministic, so it's unit-tested without React.
 */

export type LetterResult = 'correct' | 'present' | 'absent';

export interface ScoreResult {
  letter: string;
  result: LetterResult;
}

/** Score a guess against the answer using the two-pass Wordle algorithm. */
export function scoreGuess(guess: string, answer: string): ScoreResult[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const results: ScoreResult[] = g.split('').map((letter) => ({ letter, result: 'absent' }));
  const used = new Array(a.length).fill(false);

  // Pass 1: mark greens (exact position matches).
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      results[i].result = 'correct';
      used[i] = true;
    }
  }

  // Pass 2: mark yellows (letter in word but wrong position, only for unused answer letters).
  for (let i = 0; i < g.length; i++) {
    if (results[i].result === 'correct') continue;
    const idx = a.split('').findIndex((ch, j) => ch === g[i] && !used[j]);
    if (idx !== -1) {
      results[i].result = 'present';
      used[idx] = true;
    }
  }

  return results;
}

/** Is the game won (all tiles are green)? */
export function isWin(results: ScoreResult[]): boolean {
  return results.every((r) => r.result === 'correct');
}

/** Is the game over (won or out of guesses)? */
export function isGameOver(guesses: string[], maxGuesses: number, won: boolean): boolean {
  return won || guesses.length >= maxGuesses;
}
