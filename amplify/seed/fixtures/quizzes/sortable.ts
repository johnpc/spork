/** SORTABLE fixture — sort produce into Fruits vs Vegetables. Each answer's
 * `bucket` is its correct category; the renderer derives the bucket columns from
 * the distinct values. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const sortableQuiz: QuizFixture = {
  topic: 'Fruit or Vegetable?',
  categorySlug: 'food',
  description: 'Sort each item into its correct group: Fruits or Vegetables.',
  mode: 'SORTABLE',
  inputMode: 'ARRANGE',
  scoringMode: 'BUCKETING',
  timeLimitSeconds: 120,
  answers: [
    { display: 'Tomato', accepted: ['tomato'], promptKind: 'NONE', bucket: 'Fruit' },
    { display: 'Banana', accepted: ['banana'], promptKind: 'NONE', bucket: 'Fruit' },
    { display: 'Avocado', accepted: ['avocado'], promptKind: 'NONE', bucket: 'Fruit' },
    { display: 'Carrot', accepted: ['carrot'], promptKind: 'NONE', bucket: 'Vegetable' },
    { display: 'Broccoli', accepted: ['broccoli'], promptKind: 'NONE', bucket: 'Vegetable' },
    { display: 'Spinach', accepted: ['spinach'], promptKind: 'NONE', bucket: 'Vegetable' },
  ],
};
