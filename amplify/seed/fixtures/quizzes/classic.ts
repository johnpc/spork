/** CLASSIC fixture — STUB (replaced by the CLASSIC build). DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const classicQuiz: QuizFixture = {
  topic: 'CLASSIC (stub)',
  categorySlug: 'miscellaneous',
  description: 'Placeholder CLASSIC quiz.',
  mode: 'CLASSIC',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  answers: [{ display: 'Placeholder', accepted: ['placeholder'], promptKind: 'NONE' }],
};
