/**
 * The GENERATIVE start path: create a DRAFT Quiz + RUNNING GenerationRun, then
 * async-invoke the worker (which calls Claude, optionally draws images, writes
 * the answers, flips to DRAFT_READY). Returns immediately so the resolver stays
 * under its timeout. Axes come from the shared modeAxes table. Writers/invoker
 * injected so the handler test drives this without AWS.
 */
import { axesFor } from '../shared/modeAxes';
import type { GenMode } from '../shared/answersPrompt';
import type { QuizWorkerEvent } from '../worker/handler';

export interface GenQuizInput {
  runId: string;
  quizId: string;
  mode: GenMode;
  topic: string;
  categorySlug: string;
  timeLimitSeconds: number;
  answerCount: number;
  now: string;
}

export interface GenQuizDeps {
  quizTable: string;
  runTable: string;
  workerFn: string;
  putItem: (table: string, item: Record<string, unknown>) => Promise<void>;
  invokeWorker: (fn: string, event: QuizWorkerEvent) => Promise<void>;
}

export async function startGenerativeQuiz(input: GenQuizInput, deps: GenQuizDeps): Promise<void> {
  const axes = axesFor(input.mode);
  await deps.putItem(deps.quizTable, {
    id: input.quizId,
    __typename: 'Quiz',
    createdAt: input.now,
    updatedAt: input.now,
    topic: input.topic,
    categorySlug: input.categorySlug,
    mode: input.mode,
    inputMode: axes.inputMode,
    scoringMode: axes.scoringMode,
    status: 'DRAFT',
    answerCount: 0,
    timeLimitSeconds: input.timeLimitSeconds,
  });
  await deps.putItem(deps.runTable, {
    id: input.runId,
    __typename: 'GenerationRun',
    createdAt: input.now,
    updatedAt: input.now,
    game: 'QUIZZES',
    mode: input.mode,
    topic: input.topic,
    categorySlug: input.categorySlug,
    requestedCount: input.answerCount,
    generatedCount: 0,
    quizId: input.quizId,
    status: 'RUNNING',
    startedAt: input.now,
  });
  await deps.invokeWorker(deps.workerFn, {
    runId: input.runId,
    quizId: input.quizId,
    mode: input.mode,
    topic: input.topic,
    answerCount: input.answerCount,
  });
}
