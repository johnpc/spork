/** Hand-authored, valid Quizzle wager quizzes, committed so the seed is
 * deterministic. Each question's `answer` is the canonical spelling; `accepted`
 * lists lenient alternates. DATA (gate-exempt). */

export interface QuizzleQuestionFixture {
  question: string;
  answer: string;
  accepted?: string[];
}

export interface QuizzleFixture {
  topic: string;
  startingBank: number;
  questions: QuizzleQuestionFixture[];
}

export const seedQuizzles: QuizzleFixture[] = [
  {
    topic: 'World Capitals',
    startingBank: 1000,
    questions: [
      { question: 'What is the capital of France?', answer: 'Paris' },
      { question: 'What is the capital of Japan?', answer: 'Tokyo' },
      { question: 'What is the capital of Australia?', answer: 'Canberra' },
      { question: 'What is the capital of Egypt?', answer: 'Cairo' },
    ],
  },
  {
    topic: 'Science Basics',
    startingBank: 1000,
    questions: [
      {
        question: 'What gas do plants absorb from the air?',
        answer: 'carbon dioxide',
        accepted: ['CO2'],
      },
      { question: 'What is the chemical symbol for gold?', answer: 'Au' },
      { question: 'How many planets are in the Solar System?', answer: 'eight', accepted: ['8'] },
      { question: 'What force pulls objects toward Earth?', answer: 'gravity' },
    ],
  },
  {
    topic: 'Movie Trivia',
    startingBank: 500,
    questions: [
      {
        question: 'Who directed the movie Jaws?',
        answer: 'Steven Spielberg',
        accepted: ['Spielberg'],
      },
      { question: 'In The Matrix, is the pill red or blue that Neo takes?', answer: 'red' },
      { question: 'What year was the first Toy Story released?', answer: '1995' },
    ],
  },
];
