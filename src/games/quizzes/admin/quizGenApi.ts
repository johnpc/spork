/**
 * Client wrappers for the quiz-generation mutation + admin reads/writes.
 * Editors only — userPool auth (group claims in the JWT). generateQuiz kicks off
 * AI (or template) generation and returns ids immediately; the worker fills the
 * DRAFT quiz async, which the admin then publishes.
 */
import { dataClient, type GenerationRunRecord, type QuizRecord } from '../../../lib/dataClient';

const EDITOR = { authMode: 'userPool' } as const;

export interface GenerateQuizInput {
  mode: string;
  topicOrTemplate: string;
  categorySlug: string;
  timeLimitSeconds: number;
  answerCount: number;
}

/** Kick off generation; returns the new run + quiz ids immediately. */
export async function generateQuiz(
  input: GenerateQuizInput,
): Promise<{ runId: string; quizId: string }> {
  const { data, errors } = await dataClient.mutations.generateQuiz(input, EDITOR);
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to start generation.');
  return { runId: data.runId, quizId: data.quizId };
}

/** Recent QUIZ generation runs for the admin dashboard, newest first. */
export async function fetchQuizRuns(): Promise<GenerationRunRecord[]> {
  const { data } = await dataClient.models.GenerationRun.list({ limit: 100, ...EDITOR });
  return data
    .filter((r) => r.game === 'QUIZZES')
    .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
}

/** All DRAFT quizzes awaiting review/publish, newest first. */
export async function fetchDraftQuizzes(): Promise<QuizRecord[]> {
  const { data } = await dataClient.models.Quiz.list({ limit: 200, ...EDITOR });
  return data
    .filter((q) => q.status === 'DRAFT')
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** Publish a DRAFT quiz — flip status + stamp publishedAt. */
export async function publishQuiz(quizId: string, now: Date = new Date()): Promise<void> {
  const { errors } = await dataClient.models.Quiz.update(
    { id: quizId, status: 'PUBLISHED', publishedAt: now.toISOString() },
    EDITOR,
  );
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to publish quiz.');
}
