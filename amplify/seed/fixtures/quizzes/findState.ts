/** CLICKABLE fixture — "Find the US State on the map". DATA (gate-exempt). Each
 * answer is a REGION keyed by its FIPS promptValue (matching the us-atlas
 * states-10m topology). renderConfig points the map renderer at the US-states
 * atlas + geoAlbersUsa projection. The player is prompted one state at a time
 * ("Find Texas") and clicks it; MEMBERSHIP scoring. Built from the generated
 * US_STATES set so it stays in sync with the topology. */
import type { QuizFixture, AnswerFixture } from './types';
import { US_STATES } from '../../../quizgen/fixtures/usStates';

const answers: AnswerFixture[] = US_STATES.map((s) => ({
  display: s.display,
  accepted: s.accepted,
  promptKind: 'REGION',
  promptValue: s.promptValue,
}));

export const findStateQuiz: QuizFixture = {
  topic: 'Find the US State',
  categorySlug: 'geography',
  description: 'Find each state on the map of the United States.',
  mode: 'CLICKABLE',
  inputMode: 'CLICK',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 300,
  renderConfig: { topology: 'states-10m', projection: 'geoAlbersUsa' },
  answers,
};
