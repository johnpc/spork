/** CLICKABLE fixture — "Find the African countries on the map". DATA (gate-exempt).
 * Each answer is a REGION keyed by its numeric-ISO promptValue (matching the
 * world-atlas topology). The renderer prompts one country at a time ("Find
 * Nigeria") and the player clicks it on a map auto-zoomed to Africa. MEMBERSHIP
 * scoring; only the asked-for country scores. */
import type { QuizFixture, AnswerFixture } from './types';

const region = (display: string, iso: string, accepted: string[]): AnswerFixture => ({
  display,
  accepted,
  promptKind: 'REGION',
  promptValue: iso,
});

export const clickableQuiz: QuizFixture = {
  topic: 'Find the African Countries',
  categorySlug: 'geography',
  description: 'Find each country on the map of Africa before time runs out.',
  mode: 'CLICKABLE',
  inputMode: 'CLICK',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  renderConfig: { region: 'africa' },
  answers: [
    region('Egypt', '818', ['egypt', 'eg', 'egy']),
    region('Nigeria', '566', ['nigeria', 'ng', 'nga']),
    region('Kenya', '404', ['kenya', 'ke', 'ken']),
    region('Morocco', '504', ['morocco', 'ma', 'mar']),
    region('Ethiopia', '231', ['ethiopia', 'et', 'eth']),
    region('South Africa', '710', ['south africa', 'za', 'zaf']),
    region('Algeria', '012', ['algeria', 'dz', 'dza']),
    region('Ghana', '288', ['ghana', 'gh', 'gha']),
  ],
};
