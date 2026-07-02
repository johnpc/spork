/** Seed the starter Quizzes (guest-only game). Slice 1 ships one MAP quiz —
 * "World Countries" — built from the reconciled world-countries fixture (the
 * same data the generateQuiz MAP path uses). Mirrors seedDecks: create the
 * PUBLISHED Quiz, then its Answers. Answers are created in bounded-concurrency
 * batches so ~174 rows don't fan out unbounded. */
import { client, EDITOR_WRITE } from './seedClient';
import { WORLD_COUNTRIES } from '../quizgen/fixtures/worldCountries';

const ANSWER_CONCURRENCY = 20;

export async function seedQuizData(): Promise<number> {
  const now = new Date().toISOString();
  const { data: quiz, errors } = await client.models.Quiz.create(
    {
      topic: 'World Countries',
      categorySlug: 'geography',
      description: 'Name every country in the world before time runs out.',
      mode: 'MAP',
      inputMode: 'TYPE',
      scoringMode: 'MEMBERSHIP',
      status: 'PUBLISHED',
      answerCount: WORLD_COUNTRIES.length,
      timeLimitSeconds: 900,
      renderConfig: JSON.stringify({ topology: 'countries-110m', projection: 'geoEqualEarth' }),
      publishedAt: now,
    },
    EDITOR_WRITE,
  );
  if (errors || !quiz) throw new Error(`Quiz World Countries: ${JSON.stringify(errors)}`);

  for (let i = 0; i < WORLD_COUNTRIES.length; i += ANSWER_CONCURRENCY) {
    const batch = WORLD_COUNTRIES.slice(i, i + ANSWER_CONCURRENCY);
    await Promise.all(
      batch.map(async (a) => {
        const { errors: aErr } = await client.models.Answer.create(
          {
            quizId: quiz.id,
            ord: a.ord,
            promptKind: a.promptKind,
            promptValue: a.promptValue,
            display: a.display,
            accepted: JSON.stringify(a.accepted),
          },
          EDITOR_WRITE,
        );
        if (aErr) throw new Error(`Answer ${a.display}: ${JSON.stringify(aErr)}`);
      }),
    );
  }
  console.log(`Seeded 1 quiz with ${WORLD_COUNTRIES.length} answers.`);
  return 1;
}
