/** Seed the starter Quizzes (guest-only game). Loops over every registered quiz
 * fixture (one per game type) and writes the PUBLISHED Quiz + its Answer rows.
 * Answers are created in bounded-concurrency batches so large sets don't fan out
 * unbounded. Adding a game type = one fixture in fixtures/quizzes/, no edit here. */
import { client, EDITOR_WRITE } from './seedClient';
import { SEED_QUIZZES } from './fixtures/quizzes';
import { dateFor } from './fixtures/seedDates';
import type { QuizFixture } from './fixtures/quizzes/types';

const ANSWER_CONCURRENCY = 20;

async function seedOne(quiz: QuizFixture, now: string, puzzleDate: string): Promise<void> {
  const { data: created, errors } = await client.models.Quiz.create(
    {
      topic: quiz.topic,
      categorySlug: quiz.categorySlug,
      description: quiz.description,
      mode: quiz.mode,
      inputMode: quiz.inputMode,
      scoringMode: quiz.scoringMode,
      status: 'PUBLISHED',
      answerCount: quiz.answers.length,
      timeLimitSeconds: quiz.timeLimitSeconds,
      renderConfig: quiz.renderConfig ? JSON.stringify(quiz.renderConfig) : undefined,
      publishedAt: now,
      puzzleDate,
    },
    EDITOR_WRITE,
  );
  if (errors || !created) throw new Error(`Quiz ${quiz.topic}: ${JSON.stringify(errors)}`);

  for (let i = 0; i < quiz.answers.length; i += ANSWER_CONCURRENCY) {
    await Promise.all(
      quiz.answers.slice(i, i + ANSWER_CONCURRENCY).map(async (a, j) => {
        const { errors: aErr } = await client.models.Answer.create(
          {
            quizId: created.id,
            ord: i + j,
            display: a.display,
            accepted: JSON.stringify(a.accepted),
            promptKind: a.promptKind,
            promptValue: a.promptValue,
            groupKey: a.groupKey,
            hint: a.hint,
            options: a.options ? JSON.stringify(a.options) : undefined,
            orderIndex: a.orderIndex,
            bucket: a.bucket,
          },
          EDITOR_WRITE,
        );
        if (aErr) throw new Error(`Answer ${a.display}: ${JSON.stringify(aErr)}`);
      }),
    );
  }
}

export async function seedQuizData(): Promise<number> {
  const now = new Date().toISOString();
  for (let i = 0; i < SEED_QUIZZES.length; i++) {
    await seedOne(SEED_QUIZZES[i], now, dateFor(i, SEED_QUIZZES.length));
  }
  console.log(`Seeded ${SEED_QUIZZES.length} quizzes.`);
  return SEED_QUIZZES.length;
}
