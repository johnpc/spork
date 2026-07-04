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
import { fetchWordles } from '../../wordle/play/wordleApi';
import { fetchConnectionsList } from '../../connections/play/connectionsApi';
import { fetchBees } from '../../spellingbee/play/beeApi';
import { QUIZ_TYPE_GAMES, OTHER_GAMES } from '../../gameCatalog';

export interface DailyGame {
  name: string;
  fetchList: () => Promise<Dated[]>;
  playPath: (id: string) => string;
  /** localStorage key the play screen records under (play-once gate). */
  dailyKey: string;
}

type Quiz = { mode?: string; topic?: string };

/** Every topic reserved by a topic-filtered game — so the generic game of the
 * same MODE (e.g. plain Slideshow) excludes them and never grabs a capitals quiz. */
const RESERVED_TOPICS = new Set(
  QUIZ_TYPE_GAMES.map((g) => g.topicFilter).filter((t): t is string => !!t),
);

/** Quiz-type games: published quizzes of this mode. When the game pins a
 * `topicFilter`, keep only that topic (and key play-once per topic); otherwise
 * keep the mode's quizzes MINUS any reserved-topic ones (which belong to a
 * sibling topic-filtered game). */
function quizTypeEntry(quizMode: string, topicFilter?: string): Omit<DailyGame, 'name'> {
  return {
    fetchList: async () => {
      const ofMode = (await fetchPublishedQuizzes()).filter((q) => (q as Quiz).mode === quizMode);
      return topicFilter
        ? ofMode.filter((q) => (q as Quiz).topic === topicFilter)
        : ofMode.filter((q) => !RESERVED_TOPICS.has((q as Quiz).topic ?? ''));
    },
    playPath: (id) => `/quizzes/${id}/play`,
    dailyKey: topicFilter ? `quizzes:${quizMode}:${topicFilter}` : `quizzes:${quizMode}`,
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
  wordle: { fetchList: fetchWordles, playPath: (id) => `/wordle/${id}`, dailyKey: 'wordle' },
  connections: {
    fetchList: fetchConnectionsList,
    playPath: (id) => `/connections/${id}`,
    dailyKey: 'connections',
  },
  spellingbee: {
    fetchList: fetchBees,
    playPath: (id) => `/spellingbee/${id}`,
    dailyKey: 'spellingbee',
  },
};

export const DAILY_GAMES: Record<string, DailyGame> = {};
for (const g of QUIZ_TYPE_GAMES) {
  DAILY_GAMES[g.slug] = { name: g.name, ...quizTypeEntry(g.quizMode as string, g.topicFilter) };
}
for (const g of OTHER_GAMES) {
  if (STANDALONE[g.slug]) DAILY_GAMES[g.slug] = { name: g.name, ...STANDALONE[g.slug] };
}
