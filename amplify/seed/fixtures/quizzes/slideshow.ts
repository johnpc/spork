/** SLIDESHOW fixture — "Name the Artist" deck. One album prompt per slide
 * (promptKind TEXT); the player types the artist to reveal it and advance to the
 * next slide. inputMode TYPE + MEMBERSHIP scoring: any correct artist counts,
 * done when the whole deck is named. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const slideshowQuiz: QuizFixture = {
  topic: 'Name the Artist',
  categorySlug: 'music',
  description: 'One album per slide — name the artist behind each to advance the deck.',
  mode: 'SLIDESHOW',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 180,
  renderConfig: { advance: 'onCorrect' },
  answers: [
    {
      display: 'Michael Jackson',
      accepted: ['michael jackson', 'mj'],
      promptKind: 'TEXT',
      promptValue: 'Thriller (1982)',
      orderIndex: 0,
      hint: 'King of Pop',
    },
    {
      display: 'Fleetwood Mac',
      accepted: ['fleetwood mac'],
      promptKind: 'TEXT',
      promptValue: 'Rumours (1977)',
      orderIndex: 1,
    },
    {
      display: 'Pink Floyd',
      accepted: ['pink floyd'],
      promptKind: 'TEXT',
      promptValue: 'The Dark Side of the Moon (1973)',
      orderIndex: 2,
    },
    {
      display: 'Nirvana',
      accepted: ['nirvana'],
      promptKind: 'TEXT',
      promptValue: 'Nevermind (1991)',
      orderIndex: 3,
    },
    {
      display: 'Amy Winehouse',
      accepted: ['amy winehouse'],
      promptKind: 'TEXT',
      promptValue: 'Back to Black (2006)',
      orderIndex: 4,
    },
    {
      display: 'Adele',
      accepted: ['adele'],
      promptKind: 'TEXT',
      promptValue: '21 (2011)',
      orderIndex: 5,
    },
  ],
};
