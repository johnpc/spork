/** PICTURE_BOX fixture — "Guess the NBA Player". Identify people from their
 * image by typing; each answer's promptKind=IMAGE and promptValue is an image
 * placeholder (emoji stand-in for a headshot). MEMBERSHIP scoring, TYPE input.
 * DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const pictureBoxQuiz: QuizFixture = {
  topic: 'Guess the NBA Player',
  categorySlug: 'sports',
  description: 'Name each NBA superstar from their picture before time runs out.',
  mode: 'PICTURE_BOX',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  renderConfig: { columns: 3 },
  answers: [
    {
      display: 'LeBron James',
      accepted: ['lebron james', 'lebron', 'king james'],
      promptKind: 'IMAGE',
      promptValue: '👑',
      hint: 'The King',
    },
    {
      display: 'Stephen Curry',
      accepted: ['stephen curry', 'steph curry', 'curry'],
      promptKind: 'IMAGE',
      promptValue: '🎯',
      hint: 'Splash Brother',
    },
    {
      display: 'Giannis Antetokounmpo',
      accepted: ['giannis antetokounmpo', 'giannis', 'greek freak'],
      promptKind: 'IMAGE',
      promptValue: '🦌',
      hint: 'The Greek Freak',
    },
    {
      display: 'Kevin Durant',
      accepted: ['kevin durant', 'durant', 'kd'],
      promptKind: 'IMAGE',
      promptValue: '🐍',
      hint: 'Slim Reaper',
    },
    {
      display: 'Nikola Jokic',
      accepted: ['nikola jokic', 'jokic', 'the joker'],
      promptKind: 'IMAGE',
      promptValue: '🃏',
      hint: 'The Joker',
    },
    {
      display: 'Luka Doncic',
      accepted: ['luka doncic', 'luka', 'doncic'],
      promptKind: 'IMAGE',
      promptValue: '🪄',
      hint: 'Luka Magic',
    },
  ],
};
