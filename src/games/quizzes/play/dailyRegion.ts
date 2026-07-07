/**
 * Regional rotation for the world map games (MAP / CLICKABLE). The map fixture
 * always ships all ~174 countries; to make the daily puzzle feel fresh, we narrow
 * it to ONE continent per day, cycling by the day-number, with the full world as
 * a weekly finale (every 7th day). Pure over an injected clock so it's testable.
 *
 * Applied in usePlay's answer memo: it's a NO-OP for any non-map quiz (only REGION
 * answers are filtered), so the engine, score, map fill, and typed-matching all
 * naturally narrow to the day's region — "3 / 50 · Africa".
 */
import { CONTINENT_ROTATION, CONTINENT_REGIONS } from './continents';

/** The two fields the rotation reads off an answer. Loose on purpose so it
 * accepts the Amplify AnswerRecord (whose promptKind is a wider enum) as well as
 * plain fixtures — we only ever READ these. */
interface RegionAnswer {
  promptKind?: string | null;
  promptValue?: string | null;
}

/** Whole days since the Unix epoch for a YYYY-MM-DD stamp (the rotation index). */
function dayNumber(now: Date): number {
  return Math.floor(Date.parse(`${dayStamp(now)}T00:00:00Z`) / 86_400_000);
}

function dayStamp(now: Date): string {
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** The day's region for the world map game: a continent, or 'World' on the weekly
 * finale (every 7th day). ONLY the full-world MAP quiz (Worldle) rotates — a
 * CLICKABLE quiz like "Find the African Countries" is already region-scoped by
 * its authored content, so passing a non-MAP mode returns null (no filtering). */
export function dailyRegionLabel(mode: string | null | undefined, now: Date): string | null {
  if (mode !== 'MAP') return null;
  const d = dayNumber(now);
  if (d % 7 === 0) return 'World';
  return CONTINENT_ROTATION[d % CONTINENT_ROTATION.length];
}

/** The renderer mode Worldle plays TODAY. Non-MAP quizzes always play their
 * stored mode. The world map alternates day to day: the weekly World finale
 * (every 7th day) stays typed MAP — naming all ~174 countries is the showcase —
 * and other days flip MAP ⇄ CLICKABLE by parity, so some days you type the
 * continent's countries and other days you're shown a name and click where it is.
 * The stored Quiz.mode stays MAP; this is a play-time view choice keyed on the
 * date, so it needs no backend change and one daily key. */
export function dailyMapMode(mode: string | null | undefined, now: Date): string | null {
  if (mode !== 'MAP') return mode ?? null;
  const d = dayNumber(now);
  if (d % 7 === 0) return 'MAP';
  return d % 2 === 0 ? 'MAP' : 'CLICKABLE';
}

/** Narrow the world map (MAP) answer set to the day's continent (all on the
 * 'World' finale). Any non-MAP quiz passes through untouched. Generic so callers
 * get their exact answer type back; reads only via the loose RegionAnswer view. */
export function dailyRegionAnswers<T>(
  mode: string | null | undefined,
  answers: readonly T[],
  now: Date,
): T[] {
  const label = dailyRegionLabel(mode, now);
  if (!label || label === 'World') return answers as T[];
  const ids = new Set(CONTINENT_REGIONS[label] ?? []);
  return (answers as readonly T[]).filter((a) => {
    const v = (a as RegionAnswer).promptValue;
    return v != null && ids.has(v);
  });
}
