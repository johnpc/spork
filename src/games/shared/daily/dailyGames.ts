/** Registry binding each daily game to its list fetcher + play-route builder +
 * display name. DailyEntry uses this to resolve "today's puzzle" for any game
 * without knowing game specifics. Adding a daily game = one entry here. DATA. */
import type { Dated } from './pickDaily';
import { fetchPublishedQuizzes } from '../../quizzes/list/quizListApi';
import { fetchLadders } from '../../steps/play/ladderApi';
import { fetchAcrostics } from '../../acrostic/play/acrosticApi';
import { fetchQuizzles } from '../../quizzle/play/quizzleApi';
import { fetchPuzzles } from '../../chess/play/chessApi';

export interface DailyGame {
  /** localStorage key segment + display name for the recap. */
  name: string;
  fetchList: () => Promise<Dated[]>;
  /** Route into today's resolved puzzle. */
  playPath: (id: string) => string;
}

export const DAILY_GAMES: Record<string, DailyGame> = {
  quizzes: {
    name: 'Quizzes',
    fetchList: fetchPublishedQuizzes,
    playPath: (id) => `/quizzes/${id}/play`,
  },
  steps: { name: 'Steps', fetchList: fetchLadders, playPath: (id) => `/steps/${id}` },
  acrostic: { name: 'Acrostic', fetchList: fetchAcrostics, playPath: (id) => `/acrostic/${id}` },
  quizzle: { name: 'Quizzle', fetchList: fetchQuizzles, playPath: (id) => `/quizzle/${id}` },
  chess: { name: 'Chess Attack', fetchList: fetchPuzzles, playPath: (id) => `/chess/${id}` },
};
