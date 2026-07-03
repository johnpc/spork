import type { QuizMode } from './renderers';

/** A one-line "how to play" hint per quiz mode, shown under the HUD so a
 * first-timer knows the interaction before the timer pressures them. Pure and
 * exhaustive over the modes; returns '' for an unknown/typed mode that's already
 * self-evident from its input box. */
const HINTS: Record<QuizMode, string> = {
  CLASSIC: 'Type every answer in the set before time runs out.',
  MAP: 'Type each country to fill it in on the map.',
  PICTURE_BOX: 'Name what you see in each picture.',
  MULTIPLE_CHOICE: 'Pick the correct answer for each question.',
  CLICKABLE: 'Click each place on the map as it’s named.',
  PICTURE_CLICK: 'Click the right spot in the picture for each prompt.',
  SLIDESHOW: 'Name each item as the slides advance.',
  SORTABLE: 'Tap an item, then tap the bucket it belongs in.',
  ORDER_UP: 'Tap the items in the correct order.',
};

export function modeHint(mode: QuizMode | null | undefined): string {
  return mode ? (HINTS[mode] ?? '') : '';
}
