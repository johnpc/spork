/** Registry of seeded quiz fixtures — one per game type. The seed runner writes
 * every quiz here. Each type's fixture lives in its own file so the list grows
 * by one import line per type (no merge collisions). DATA (gate-exempt). */
import type { QuizFixture } from './types';
import { worldCountriesQuiz } from './map';
import { classicQuiz } from './classic';
import { multipleChoiceQuiz } from './multipleChoice';
import { pictureBoxQuiz } from './pictureBox';
import { clickableQuiz } from './clickable';
import { pictureClickQuiz } from './pictureClick';
import { slideshowQuiz } from './slideshow';
import { sortableQuiz } from './sortable';
import { orderUpQuiz } from './orderUp';

export const SEED_QUIZZES: QuizFixture[] = [
  worldCountriesQuiz,
  classicQuiz,
  multipleChoiceQuiz,
  pictureBoxQuiz,
  clickableQuiz,
  pictureClickQuiz,
  slideshowQuiz,
  sortableQuiz,
  orderUpQuiz,
];
