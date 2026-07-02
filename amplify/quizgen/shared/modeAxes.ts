/** Pure mode → (inputMode, scoringMode) mapping — the canonical axis table for
 * every quiz mode (see CLAUDE.md). Single source of truth shared by the starter,
 * the worker, and fixture generation so a mode's axes never drift. */
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

export interface Axes {
  inputMode: 'TYPE' | 'PICK' | 'CLICK' | 'ARRANGE';
  scoringMode: 'MEMBERSHIP' | 'SEQUENCE' | 'BUCKETING' | 'ELIMINATION';
}

const AXES: Record<QuizMode, Axes> = {
  CLASSIC: { inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' },
  MAP: { inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' },
  PICTURE_BOX: { inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' },
  SLIDESHOW: { inputMode: 'TYPE', scoringMode: 'MEMBERSHIP' },
  MULTIPLE_CHOICE: { inputMode: 'PICK', scoringMode: 'MEMBERSHIP' },
  CLICKABLE: { inputMode: 'CLICK', scoringMode: 'MEMBERSHIP' },
  PICTURE_CLICK: { inputMode: 'CLICK', scoringMode: 'MEMBERSHIP' },
  SORTABLE: { inputMode: 'ARRANGE', scoringMode: 'BUCKETING' },
  ORDER_UP: { inputMode: 'ARRANGE', scoringMode: 'SEQUENCE' },
};

export function axesFor(mode: string): Axes {
  const a = AXES[mode as QuizMode];
  if (!a) throw new Error(`unknown quiz mode: ${mode}`);
  return a;
}
