/**
 * The renderer registry — the heart of the engine/renderer split. Every quiz
 * mode maps to a component that consumes the SAME contract (the quiz's answers +
 * the engine's found set) and nothing else. Adding a mode (TYPING/GRID/…) is a
 * new entry here plus its component — the engine never changes. MAP is the only
 * renderer built this slice; others fall back to MAP's contract when added.
 */
import type { ComponentType } from 'react';
import type { AnswerRecord } from '../../../lib/dataClient';
import { WorldMap } from './WorldMap';

/** The one prop contract every renderer honors. */
export interface RendererProps {
  answers: AnswerRecord[];
  found: ReadonlySet<string>;
}

export type QuizMode = 'MAP' | 'TYPING' | 'GRID' | 'MULTIPLE_CHOICE' | 'ORDERED';

/** mode → renderer. Missing modes are unbuilt (Play shows a fallback message). */
export const RENDERERS: Partial<Record<QuizMode, ComponentType<RendererProps>>> = {
  MAP: WorldMap,
};

/** Resolve the renderer for a quiz mode, or null if that mode isn't built yet. */
export function rendererFor(mode: string | null | undefined): ComponentType<RendererProps> | null {
  if (!mode) return null;
  return RENDERERS[mode as QuizMode] ?? null;
}
