/** Registry binding each daily game (by /daily/:game slug) to its list fetcher,
 * play-route builder, display name, and localStorage daily key. Quiz TYPES draw
 * from the published-quiz list filtered to their mode and gate per type
 * (quizzes:<MODE>); the standalone islands use their own fetchers. Built from the
 * shared game catalog so Home and the daily entry never drift. */
import type { Dated } from './pickDaily';
import { fetchPublishedQuizzes } from '../../quizzes/list/quizListApi';
import { fetchLadders } from '../../steps/play/ladderApi';
import { fetchAcrostics } from '../../acrostic/play/acrosticApi';
import { fetchQuizzles } from '../../quizzle/play/quizzleApi';
import { fetchPuzzles } from '../../chess/play/chessApi';
import { QUIZ_TYPE_GAMES, OTHER_GAMES } from '../../gameCatalog';

export interface DailyGame {
  name: string;
  fetchList: () => Promise<Dated[]>;
  playPath: (id: string) => string;
  /** localStorage key the play screen records under (play-once gate). */
  dailyKey: string;
}

/** Quiz-type games: fetch published quizzes of this mode only. */
function quizTypeEntry(quizMode: string): Omit<DailyGame, 'name'> {
  return {
    fetchList: async () =>
      (await fetchPublishedQuizzes()).filter((q) => (q as { mode?: string }).mode === quizMode),
    playPath: (id) => `/quizzes/${id}/play`,
    dailyKey: `quizzes:${quizMode}`,
  };
}

const STANDALONE: Record<string, Omit<DailyGame, 'name'>> = {
  steps: { fetchList: fetchLadders, playPath: (id) => `/steps/${id}`, dailyKey: 'steps' },
  acrostic: {
    fetchList: fetchAcrostics,
    playPath: (id) => `/acrostic/${id}`,
    dailyKey: 'acrostic',
  },
  quizzle: { fetchList: fetchQuizzles, playPath: (id) => `/quizzle/${id}`, dailyKey: 'quizzle' },
  chess: { fetchList: fetchPuzzles, playPath: (id) => `/chess/${id}`, dailyKey: 'chess' },
};

export const DAILY_GAMES: Record<string, DailyGame> = {};
for (const g of QUIZ_TYPE_GAMES) {
  DAILY_GAMES[g.slug] = { name: g.name, ...quizTypeEntry(g.quizMode as string) };
}
for (const g of OTHER_GAMES) {
  if (STANDALONE[g.slug]) DAILY_GAMES[g.slug] = { name: g.name, ...STANDALONE[g.slug] };
}
