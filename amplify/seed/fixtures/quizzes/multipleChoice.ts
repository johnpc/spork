/** MULTIPLE_CHOICE fixture — pick the correct answer per question, one at a time.
 * Each answer's `display` is the CORRECT choice; `options` lists the choices
 * shown; `promptValue` (promptKind=TEXT) is the question. MEMBERSHIP scoring: any
 * correct pick counts, done when all found. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const multipleChoiceQuiz: QuizFixture = {
  topic: 'World Capitals Quiz',
  categorySlug: 'geography',
  description: 'Pick the correct capital city for each country.',
  mode: 'MULTIPLE_CHOICE',
  inputMode: 'PICK',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 120,
  answers: [
    {
      display: 'Paris',
      accepted: ['paris'],
      promptKind: 'TEXT',
      promptValue: 'What is the capital of France?',
      options: ['Paris', 'Lyon', 'Marseille', 'Nice'],
    },
    {
      display: 'Tokyo',
      accepted: ['tokyo'],
      promptKind: 'TEXT',
      promptValue: 'What is the capital of Japan?',
      options: ['Osaka', 'Tokyo', 'Kyoto', 'Nagoya'],
    },
    {
      display: 'Canberra',
      accepted: ['canberra'],
      promptKind: 'TEXT',
      promptValue: 'What is the capital of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    },
    {
      display: 'Ottawa',
      accepted: ['ottawa'],
      promptKind: 'TEXT',
      promptValue: 'What is the capital of Canada?',
      options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
    },
    {
      display: 'Brasília',
      accepted: ['brasilia', 'brasília'],
      promptKind: 'TEXT',
      promptValue: 'What is the capital of Brazil?',
      options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
    },
  ],
};
