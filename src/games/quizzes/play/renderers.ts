/**
 * The renderer registry — the heart of the engine/renderer split. Every quiz
 * mode maps to a component that consumes the SAME contract: the quiz's answers,
 * the engine's found set, and `attempt` (to answer by resolved id, for
 * click/pick/arrange renderers). Typed-input renderers ignore `attempt` and use
 * the shared PlayInput instead. Adding a mode is a new entry here + its
 * component — the engine never changes.
 */
import type { ComponentType } from 'react';
import type { AnswerRecord } from '../../../lib/dataClient';
import { WorldMap } from './WorldMap';

/** The one prop contract every renderer honors. */
export interface RendererProps {
  answers: AnswerRecord[];
  found: ReadonlySet<string>;
  /** Register a resolved attempt by answer id (+ optional bucket). Returns hit. */
  attempt: (answerId: string | null, bucket?: string) => boolean;
}

export type QuizMode =
  | 'CLASSIC'
  | 'MAP'
  | 'PICTURE_BOX'
  | 'MULTIPLE_CHOICE'
  | 'CLICKABLE'
  | 'PICTURE_CLICK'
  | 'SLIDESHOW'
  | 'SORTABLE'
  | 'ORDER_UP';

/** Typed-input modes use the shared PlayInput box; the rest answer via `attempt`
 * inside their own renderer. Play reads this to decide whether to show the box. */
export const TYPED_MODES: ReadonlySet<QuizMode> = new Set([
  'CLASSIC',
  'MAP',
  'PICTURE_BOX',
  'SLIDESHOW',
]);

/** mode → renderer. Missing modes are unbuilt (Play shows a fallback message). */
export const RENDERERS: Partial<Record<QuizMode, ComponentType<RendererProps>>> = {
  MAP: WorldMap,
};

/** Resolve the renderer for a quiz mode, or null if that mode isn't built yet. */
export function rendererFor(mode: string | null | undefined): ComponentType<RendererProps> | null {
  if (!mode) return null;
  return RENDERERS[mode as QuizMode] ?? null;
}

/** Whether a mode uses the shared typed-input box (vs. answering in-renderer). */
export function usesTypedInput(mode: string | null | undefined): boolean {
  return !!mode && TYPED_MODES.has(mode as QuizMode);
}
