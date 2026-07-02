/** MAP fixture — the world-countries quiz, sourced from the generated template
 * (topology ↔ ISO ↔ aliases). DATA (gate-exempt). */
import type { QuizFixture } from './types';
import { WORLD_COUNTRIES } from '../../../quizgen/fixtures/worldCountries';

export const worldCountriesQuiz: QuizFixture = {
  topic: 'World Countries',
  categorySlug: 'geography',
  description: 'Name every country in the world before time runs out.',
  mode: 'MAP',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 900,
  renderConfig: { topology: 'countries-110m', projection: 'geoEqualEarth' },
  answers: WORLD_COUNTRIES.map((a) => ({
    display: a.display,
    accepted: a.accepted,
    promptKind: 'REGION',
    promptValue: a.promptValue,
  })),
};
