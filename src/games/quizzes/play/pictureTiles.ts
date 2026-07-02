/**
 * Pure helper for the PICTURE_BOX renderer. Turns the quiz's answers + the
 * engine's found set (ANSWER IDS) into view-ready tiles: each carries the image
 * to show (promptValue — an image URL or emoji placeholder) and, once found,
 * the label to reveal. Kept pure so the renderer stays a thin view and this
 * logic is unit-tested in isolation.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

export interface PictureTile {
  id: string;
  image: string;
  label: string;
  found: boolean;
}

/** Map answers → tiles, marking those whose id is in the found set as revealed. */
export function buildTiles(answers: AnswerRecord[], found: ReadonlySet<string>): PictureTile[] {
  return answers.map((a) => ({
    id: a.id,
    image: a.promptValue ?? '',
    label: a.display,
    found: found.has(a.id),
  }));
}
