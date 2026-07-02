/**
 * Per-mode mappers: one small pure function per generative mode that turns a raw
 * tool item (+ its base fields) into a universal Answer row, or null if invalid.
 * Split out of parseAnswers so each mapper stays trivially simple (low CRAP) and
 * the parser is a thin dispatch over this table.
 */
import type { GenMode } from './answersPrompt';
import type { ParsedAnswer } from './parseAnswers';

export interface Base {
  display: string;
  accepted: string[]; // already includes display
}

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

type Mapper = (o: Record<string, unknown>, base: Base, i: number) => ParsedAnswer | null;

const listRow = (base: Base): ParsedAnswer => ({ promptKind: 'NONE', ...base });

export const MAPPERS: Record<GenMode, Mapper> = {
  CLASSIC: (_o, base) => listRow(base),
  ORDER_UP: (_o, base, i) => ({ ...listRow(base), orderIndex: i }),
  SORTABLE: (o, base) => {
    const bucket = str(o.bucket);
    return bucket ? { ...listRow(base), bucket } : null;
  },
  MULTIPLE_CHOICE: (o, base) => {
    const question = str(o.question);
    const options = strArr(o.options);
    if (!question || options.length < 2 || !options.includes(base.display)) return null;
    return { promptKind: 'TEXT', promptValue: question, ...base, options };
  },
  SLIDESHOW: (o, base) => promptRow(o, base),
  PICTURE_CLICK: (o, base) => promptRow(o, base),
  PICTURE_BOX: (o, base) => ({
    promptKind: 'IMAGE',
    ...base,
    imagePrompt: str(o.imagePrompt) ?? base.display,
  }),
};

/** TEXT-prompt row shared by SLIDESHOW + PICTURE_CLICK (requires a prompt). */
function promptRow(o: Record<string, unknown>, base: Base): ParsedAnswer | null {
  const prompt = str(o.prompt);
  return prompt ? { promptKind: 'TEXT', promptValue: prompt, ...base } : null;
}
