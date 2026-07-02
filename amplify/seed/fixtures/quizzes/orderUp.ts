/** ORDER_UP fixture — arrange U.S. space milestones oldest → newest. Each answer
 * carries orderIndex (its correct position); SEQUENCE scoring counts them only in
 * that order. DATA (gate-exempt). */
import type { QuizFixture } from './types';

export const orderUpQuiz: QuizFixture = {
  topic: 'Space Race Timeline',
  categorySlug: 'history',
  description: 'Put these milestones of the Space Age in chronological order, oldest first.',
  mode: 'ORDER_UP',
  inputMode: 'ARRANGE',
  scoringMode: 'SEQUENCE',
  timeLimitSeconds: 120,
  renderConfig: { orderBy: 'chronological' },
  answers: [
    {
      display: 'Sputnik 1 launched (1957)',
      accepted: ['sputnik 1', 'sputnik'],
      promptKind: 'NONE',
      orderIndex: 0,
    },
    {
      display: 'Yuri Gagarin orbits Earth (1961)',
      accepted: ['gagarin', 'yuri gagarin'],
      promptKind: 'NONE',
      orderIndex: 1,
    },
    {
      display: 'First spacewalk by Alexei Leonov (1965)',
      accepted: ['leonov', 'first spacewalk'],
      promptKind: 'NONE',
      orderIndex: 2,
    },
    {
      display: 'Apollo 11 lands on the Moon (1969)',
      accepted: ['apollo 11', 'moon landing'],
      promptKind: 'NONE',
      orderIndex: 3,
    },
    {
      display: 'Skylab, first U.S. space station (1973)',
      accepted: ['skylab'],
      promptKind: 'NONE',
      orderIndex: 4,
    },
    {
      display: 'Space Shuttle Columbia first flight (1981)',
      accepted: ['columbia', 'space shuttle columbia'],
      promptKind: 'NONE',
      orderIndex: 5,
    },
  ],
};
