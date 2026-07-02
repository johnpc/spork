/** PICTURE_BOX fixture — "Guess the World Landmark". Identify each landmark from
 * its AI-generated image by typing. Each answer's promptKind=IMAGE and
 * promptValue is a PERMANENT files.jpc.io URL to a Bedrock-drawn image (baked by
 * scripts/genPictureBox.ts — regenerate to refresh). MEMBERSHIP scoring, TYPE
 * input. DATA (gate-exempt). */
import type { QuizFixture } from './types';
import { PICTURE_BOX_SUBJECTS } from '../../../quizgen/fixtures/pictureBoxImages';

export const pictureBoxQuiz: QuizFixture = {
  topic: 'Guess the World Landmark',
  categorySlug: 'geography',
  description: 'Name each world landmark from its picture before time runs out.',
  mode: 'PICTURE_BOX',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  renderConfig: { columns: 3 },
  answers: PICTURE_BOX_SUBJECTS.map((s) => ({
    display: s.display,
    accepted: s.accepted,
    promptKind: 'IMAGE',
    promptValue: s.image,
    hint: s.hint,
  })),
};
