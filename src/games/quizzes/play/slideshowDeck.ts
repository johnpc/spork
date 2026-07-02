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
  /** The current slide to answer (first unfound), or null when the deck is done. */
  current: Slide | null;
  /** 1-based position of the current slide within the ordered deck (0 when done). */
  position: number;
  total: number;
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

/** Derive the current slide (first unfound) + progress from the found set. */
export function deckState(answers: AnswerRecord[], found: ReadonlySet<string>): DeckState {
  const slides = orderedSlides(answers);
  const idx = slides.findIndex((s) => !found.has(s.id));
  const current = idx === -1 ? null : slides[idx];
  return { current, position: idx === -1 ? 0 : idx + 1, total: slides.length };
}

function sortKey(a: AnswerRecord): string {
  const idx = a.orderIndex == null ? 9999 : a.orderIndex;
  return `${String(idx).padStart(5, '0')} ${a.display ?? ''}`;
}
