/** PICTURE_CLICK fixture — a simple labeled-diagram click quiz. Each REGION
 * answer is a hotspot on a 2x2 placeholder image (data-hotspot = promptValue);
 * the player is prompted (hint) to click one quadrant at a time. MEMBERSHIP
 * scoring: every quadrant clicked correctly counts. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const pictureClickQuiz: QuizFixture = {
  topic: 'Compass Rose: Click the Direction',
  categorySlug: 'geography',
  description: 'Read each direction and click the matching quadrant of the compass.',
  mode: 'PICTURE_CLICK',
  inputMode: 'CLICK',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  renderConfig: { image: 'compass-2x2', layout: 'quadrants' },
  answers: [
    {
      display: 'Northwest',
      accepted: ['northwest', 'nw'],
      promptKind: 'REGION',
      promptValue: 'nw',
      hint: 'Click the Northwest (top-left) quadrant',
    },
    {
      display: 'Northeast',
      accepted: ['northeast', 'ne'],
      promptKind: 'REGION',
      promptValue: 'ne',
      hint: 'Click the Northeast (top-right) quadrant',
    },
    {
      display: 'Southwest',
      accepted: ['southwest', 'sw'],
      promptKind: 'REGION',
      promptValue: 'sw',
      hint: 'Click the Southwest (bottom-left) quadrant',
    },
    {
      display: 'Southeast',
      accepted: ['southeast', 'se'],
      promptKind: 'REGION',
      promptValue: 'se',
      hint: 'Click the Southeast (bottom-right) quadrant',
    },
  ],
};
