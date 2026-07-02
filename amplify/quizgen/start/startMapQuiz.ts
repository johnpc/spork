/**
 * The MAP (template-backed) generation path — no Bedrock, no worker. Instantiates
 * a published Quiz + its Answer rows straight from the reconciled world-countries
 * fixture, and records a DRAFT_READY GenerationRun. Map templates are trusted
 * (deterministic, no LLM), so the quiz is PUBLISHED immediately. The DynamoDB
 * writers are injected so the handler test drives this without AWS.
 */
import { WORLD_COUNTRIES } from '../fixtures/worldCountries';
import { titleFor } from '../shared/templateTitle';
import type { MapAnswer } from '../shared/buildMapAnswers';

/** Templates this path can instantiate → their answer set + view config. */
const TEMPLATES: Record<string, { answers: MapAnswer[]; topology: string }> = {
  'world-countries': { answers: WORLD_COUNTRIES, topology: 'countries-110m' },
};

export interface MapQuizInput {
  runId: string;
  quizId: string;
  template: string;
  categorySlug: string;
  timeLimitSeconds: number;
  now: string;
}

export interface MapQuizTables {
  quizTable: string;
  answerTable: string;
  runTable: string;
}

export interface MapQuizWriters {
  putItem: (table: string, item: Record<string, unknown>) => Promise<void>;
  batchPut: (table: string, items: Record<string, unknown>[]) => Promise<void>;
}

/** Build + persist a map quiz from a template. Throws on an unknown template. */
export async function startMapQuiz(
  input: MapQuizInput,
  tables: MapQuizTables,
  writers: MapQuizWriters,
): Promise<void> {
  const template = TEMPLATES[input.template];
  if (!template) throw new Error(`unknown map template: ${input.template}`);
  const { answers, topology } = template;

  await writers.putItem(tables.quizTable, {
    id: input.quizId,
    __typename: 'Quiz',
    createdAt: input.now,
    updatedAt: input.now,
    topic: titleFor(input.template),
    categorySlug: input.categorySlug,
    mode: 'MAP',
    status: 'PUBLISHED',
    answerCount: answers.length,
    timeLimitSeconds: input.timeLimitSeconds,
    renderConfig: JSON.stringify({ topology, projection: 'geoEqualEarth' }),
    publishedAt: input.now,
  });

  await writers.batchPut(
    tables.answerTable,
    answers.map((a) => ({
      id: `${input.quizId}#${a.promptValue}`,
      __typename: 'Answer',
      createdAt: input.now,
      updatedAt: input.now,
      quizId: input.quizId,
      ord: a.ord,
      promptKind: a.promptKind,
      promptValue: a.promptValue,
      display: a.display,
      accepted: JSON.stringify(a.accepted),
    })),
  );

  await writers.putItem(tables.runTable, {
    id: input.runId,
    __typename: 'GenerationRun',
    createdAt: input.now,
    updatedAt: input.now,
    game: 'QUIZZES',
    mode: 'MAP',
    topic: titleFor(input.template),
    categorySlug: input.categorySlug,
    requestedCount: answers.length,
    generatedCount: answers.length,
    quizId: input.quizId,
    status: 'DRAFT_READY',
    startedAt: input.now,
  });
}
