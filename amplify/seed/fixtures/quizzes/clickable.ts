/** CLICKABLE fixture — "Click the African countries". DATA (gate-exempt). The
 * answers are the CORRECT tiles (African countries, MEMBERSHIP-scored); the same
 * decoy pool (non-African countries) rides on each answer's `options` so the
 * renderer can mix in wrong tiles that never score. */
import type { QuizFixture, AnswerFixture } from './types';

const DECOYS = ['Brazil', 'Canada', 'Japan', 'Spain', 'Peru'];

const country = (display: string, accepted: string[]): AnswerFixture => ({
  display,
  accepted,
  promptKind: 'NONE',
  options: DECOYS,
});

export const clickableQuiz: QuizFixture = {
  topic: 'Click the African Countries',
  categorySlug: 'geography',
  description: 'Pick out every African country from the grid of tiles.',
  mode: 'CLICKABLE',
  inputMode: 'CLICK',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  renderConfig: { prompt: 'Click the African countries' },
  answers: [
    country('Egypt', ['egypt']),
    country('Kenya', ['kenya']),
    country('Nigeria', ['nigeria']),
    country('Morocco', ['morocco']),
    country('Ethiopia', ['ethiopia']),
    country('Ghana', ['ghana']),
  ],
};
