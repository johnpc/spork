/**
 * Pure helper for the SLIDESHOW renderer. A slideshow shows ONE prompt at a
 * time: the player types the answer for the current slide, which reveals it and
 * advances the deck to the next unfound slide. We keep a STABLE slide order (by
 * orderIndex then display) so the deck never reshuffles as items are found, and
 * derive the current slide + progress purely so the renderer stays a thin view.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

export interface Slide {
  id: string;
  /** TEXT clue string or IMAGE media key — how this slide prompts the player. */
  promptKind: string;
  promptValue: string;
  display: string;
}

export interface DeckState {
  /** The current slide to answer, or null when every slide is found. */
  current: Slide | null;
  /** 1-based position of the current slide within the ordered deck (0 when done). */
  position: number;
  total: number;
  /** How many slides remain unfound — the modulus a Skip cursor cycles through. */
  remaining: number;
}

/** Order the deck stably: by orderIndex when present, then display label. */
export function orderedSlides(answers: AnswerRecord[]): Slide[] {
  return [...answers]
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    .map((a) => ({
      id: a.id,
      promptKind: a.promptKind ?? 'TEXT',
      promptValue: a.promptValue ?? '',
      display: a.display ?? '',
    }));
}

/** Derive the current slide + progress from the found set and a Skip `cursor`.
 * The cursor selects WHICH unfound slide to show (cursor mod unfound-count), so
 * Skip can move past a prompt the player doesn't know WITHOUT scoring it — the
 * skipped slide stays in the deck and comes around again. Answering removes a
 * slide from the unfound list, shrinking the ring. */
export function deckState(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
  cursor = 0,
): DeckState {
  const slides = orderedSlides(answers);
  const unfound = slides.filter((s) => !found.has(s.id));
  if (unfound.length === 0)
    return { current: null, position: 0, total: slides.length, remaining: 0 };
  const pick = unfound[((cursor % unfound.length) + unfound.length) % unfound.length];
  return {
    current: pick,
    position: slides.indexOf(pick) + 1,
    total: slides.length,
    remaining: unfound.length,
  };
}

function sortKey(a: AnswerRecord): string {
  const idx = a.orderIndex == null ? 9999 : a.orderIndex;
  return `${String(idx).padStart(5, '0')} ${a.display ?? ''}`;
}
