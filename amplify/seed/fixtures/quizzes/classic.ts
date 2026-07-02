/** CLASSIC fixture — "name the hidden list" (typed input, membership scoring).
   The player types answers to reveal a fixed grid of slots. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const classicQuiz: QuizFixture = {
  topic: 'US Presidents of the 2000s',
  categorySlug: 'history',
  description: 'Name the men who have served as US President since the year 2000.',
  mode: 'CLASSIC',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  answers: [
    {
      display: 'Bill Clinton',
      accepted: ['bill clinton', 'clinton', 'william clinton'],
      promptKind: 'NONE',
    },
    {
      display: 'George W. Bush',
      accepted: ['george w bush', 'george bush', 'bush', 'w bush'],
      promptKind: 'NONE',
    },
    {
      display: 'Barack Obama',
      accepted: ['barack obama', 'obama'],
      promptKind: 'NONE',
    },
    {
      display: 'Donald Trump',
      accepted: ['donald trump', 'trump'],
      promptKind: 'NONE',
    },
    {
      display: 'Joe Biden',
      accepted: ['joe biden', 'biden', 'joseph biden'],
      promptKind: 'NONE',
    },
  ],
};
