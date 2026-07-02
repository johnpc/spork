/** The Home game shelf data — one entry per game island (DATA, not logic).
 * `emoji` + `accent` give each card its identity; `to` routes into the game. */
export interface GameCard {
  name: string;
  tagline: string;
  to: string;
  testId: string;
  emoji: string;
  accent: string; // gradient for the card face
}

export const GAMES: GameCard[] = [
  {
    name: 'Quizzes',
    tagline: 'Name them all before the clock runs out.',
    to: '/quizzes',
    testId: 'game-quizzes',
    emoji: '🗺️',
    accent: 'linear-gradient(135deg, #5b8def, #4a7fe0)',
  },
  {
    name: 'Steps',
    tagline: 'Turn one word into another, one letter at a time.',
    to: '/steps',
    testId: 'game-steps',
    emoji: '🪜',
    accent: 'linear-gradient(135deg, #f6a23c, #ea7d2b)',
  },
  {
    name: 'Acrostic',
    tagline: 'Solve the clues to reveal a hidden quote.',
    to: '/acrostic',
    testId: 'game-acrostic',
    emoji: '📜',
    accent: 'linear-gradient(135deg, #a97cf0, #8b5fd6)',
  },
  {
    name: 'Quizzle',
    tagline: 'Wager your confidence on every answer.',
    to: '/quizzle',
    testId: 'game-quizzle',
    emoji: '🎲',
    accent: 'linear-gradient(135deg, #ef5b8d, #d64a7f)',
  },
  {
    name: 'Chess Attack',
    tagline: 'Solve the puzzle — checkmate in a few moves.',
    to: '/chess',
    testId: 'game-chess',
    emoji: '♟️',
    accent: 'linear-gradient(135deg, #55606e, #3a4450)',
  },
  {
    name: 'Flashcards',
    tagline: 'Learn anything with spaced repetition.',
    to: '/discover',
    testId: 'game-flashcards',
    emoji: '🃏',
    accent: 'linear-gradient(135deg, #34c08a, #22a06b)',
  },
];
