/**
 * Per-mode tool-schema data for the generate_answers prompt — the property set
 * Claude fills for each generative quiz mode, plus a one-line authoring hint.
 * DATA that answersPrompt composes; kept separate so the prompt builder stays a
 * short pure function. `display` + `accepted` are universal; the rest are the
 * mode-specific extras that map into the universal Answer row.
 */
import type { GenMode } from './answersPrompt';

const accepted = {
  type: 'array',
  items: { type: 'string' },
  description: 'accepted spellings/aliases',
};

export const ITEM_PROPS: Record<GenMode, Record<string, unknown>> = {
  CLASSIC: {
    display: { type: 'string', description: 'the canonical answer shown when found' },
    accepted,
  },
  SLIDESHOW: {
    prompt: { type: 'string', description: 'the slide prompt/clue shown to the player' },
    display: { type: 'string', description: 'the canonical answer for this slide' },
    accepted,
  },
  PICTURE_BOX: {
    display: { type: 'string', description: 'the thing/person depicted (the answer)' },
    accepted,
    imagePrompt: { type: 'string', description: 'a text-to-image prompt to draw this answer' },
  },
  PICTURE_CLICK: {
    prompt: { type: 'string', description: 'the clue naming what to click' },
    display: { type: 'string', description: 'the correct region label' },
    accepted,
  },
  MULTIPLE_CHOICE: {
    question: { type: 'string', description: 'the question text' },
    display: { type: 'string', description: 'the correct answer' },
    options: {
      type: 'array',
      items: { type: 'string' },
      description: '3-4 choices incl. the correct one',
    },
  },
  SORTABLE: {
    display: { type: 'string', description: 'the item to sort' },
    bucket: { type: 'string', description: 'the exact category this item belongs to' },
  },
  ORDER_UP: {
    display: { type: 'string', description: 'the item to place in sequence' },
    accepted,
  },
};

export const MODE_HINT: Record<GenMode, string> = {
  CLASSIC: 'A "name them all" list. Each item is one correct answer.',
  SLIDESHOW: 'One prompt per slide; each has a single correct answer.',
  PICTURE_BOX: 'Each item is depicted by an image; give a vivid imagePrompt to draw it.',
  PICTURE_CLICK: 'Each item is a labeled region the player clicks given a clue.',
  MULTIPLE_CHOICE: 'Each item is a question with 3-4 options; `display` MUST be one of `options`.',
  SORTABLE: 'Each item belongs in exactly one bucket; use a small set of 2-4 distinct buckets.',
  ORDER_UP: 'List items in their CORRECT sequence order (first to last); order matters.',
};
