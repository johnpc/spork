/**
 * Which quiz TYPES the daily ingester generates fresh each day. Text-generative
 * modes only: they produce genuinely new, self-contained content from a topic.
 * Excluded on purpose:
 *  • MAP / CLICKABLE — template-backed (the world map doesn't change).
 *  • PICTURE_BOX / PICTURE_CLICK — need image generation (Stability + S3); their
 *    seeded puzzles stand until an image-daily pass is added.
 * Each entry maps a quiz mode to the Discover category its topic sits under.
 */
import type { GenMode } from '../../quizgen/shared/answersPrompt';

export interface QuizGenType {
  mode: GenMode;
  categorySlug: string;
}

export const DAILY_QUIZ_TYPES: QuizGenType[] = [
  { mode: 'CLASSIC', categorySlug: 'general' },
  { mode: 'MULTIPLE_CHOICE', categorySlug: 'general' },
  { mode: 'SLIDESHOW', categorySlug: 'general' },
  { mode: 'SORTABLE', categorySlug: 'general' },
  { mode: 'ORDER_UP', categorySlug: 'general' },
];
