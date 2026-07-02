/** Shared shape for a seeded quiz fixture — DATA (gate-exempt). One per game
 * type; the seed runner (seedQuizzes.ts) loops over the registered fixtures and
 * writes each Quiz + its Answer rows. Mirror of the schema's 3-axis model. */
export interface AnswerFixture {
  display: string;
  accepted: string[];
  promptKind: 'NONE' | 'TEXT' | 'IMAGE' | 'REGION' | 'CELL';
  promptValue?: string;
  groupKey?: string;
  hint?: string;
  options?: string[]; // MULTIPLE_CHOICE / CLICKABLE
  orderIndex?: number; // ORDER_UP
  bucket?: string; // SORTABLE
}

export interface QuizFixture {
  topic: string;
  categorySlug: string;
  description: string;
  mode:
    | 'CLASSIC'
    | 'MAP'
    | 'PICTURE_BOX'
    | 'MULTIPLE_CHOICE'
    | 'CLICKABLE'
    | 'PICTURE_CLICK'
    | 'SLIDESHOW'
    | 'SORTABLE'
    | 'ORDER_UP';
  inputMode: 'TYPE' | 'PICK' | 'CLICK' | 'ARRANGE';
  scoringMode: 'MEMBERSHIP' | 'SEQUENCE' | 'BUCKETING' | 'ELIMINATION';
  timeLimitSeconds: number;
  renderConfig?: Record<string, unknown>;
  answers: AnswerFixture[];
}
