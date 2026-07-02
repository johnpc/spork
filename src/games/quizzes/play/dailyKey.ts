/**
 * Each quiz TYPE plays as its own daily puzzle — a MAP quiz and a MULTIPLE_CHOICE
 * quiz are different enough to feel like different games — so the daily
 * play-once record is keyed per mode (e.g. "quizzes:MAP"), not one shared
 * "quizzes" key. Pure so it's unit-tested and reused by the shelf + play screen.
 */
export function dailyKeyForMode(mode: string | null | undefined): string {
  return mode ? `quizzes:${mode}` : 'quizzes';
}
