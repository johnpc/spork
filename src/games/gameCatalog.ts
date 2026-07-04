/**
 * The single source of truth for every daily game Spork offers. Each quiz TYPE
 * is its own daily game (a MAP quiz and an ORDER_UP quiz feel like different
 * games), alongside the standalone islands (Steps, Acrostic, Quizzle, Chess) and
 * Flashcards. Home renders a card per entry; the daily registry resolves today's
 * puzzle per entry. DATA — no logic, so it's gate-exempt in spirit and trivial.
 *
 * `slug` is the /daily/:game route segment. For quiz types, `quizMode` selects
 * which published quizzes to draw from and `dailyKey` (quizzes:<MODE>) matches
 * what the play screen records, so play-once gating lines up per type.
 */
export interface GameDef {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  accent: string; // gradient for the Home card face
  /** Quiz mode this game draws from (quiz-type games only). */
  quizMode?: string;
  /** Restrict this game to published quizzes whose topic matches (exact). Lets
   * several games share one quiz MODE but stay distinct — e.g. World Capitals and
   * US State Capitals are both SLIDESHOW but pick different quizzes by topic. */
  topicFilter?: string;
  /** Non-daily destination override (Flashcards browses decks in Discover). */
  href?: string;
}

const BLUE = 'linear-gradient(135deg, #5b8def, #4a7fe0)';
const TEAL = 'linear-gradient(135deg, #2bb3c0, #1f97a8)';
const INDIGO = 'linear-gradient(135deg, #6d7cf0, #5560d6)';
const GREEN = 'linear-gradient(135deg, #34c08a, #22a06b)';
const AMBER = 'linear-gradient(135deg, #f6a23c, #ea7d2b)';
const ROSE = 'linear-gradient(135deg, #ef5b8d, #d64a7f)';
const VIOLET = 'linear-gradient(135deg, #a97cf0, #8b5fd6)';
const SLATE = 'linear-gradient(135deg, #55606e, #3a4450)';

/** The nine quiz TYPES, each a distinct daily game with a game-y name. */
export const QUIZ_TYPE_GAMES: GameDef[] = [
  {
    slug: 'worldle',
    name: 'Worldle',
    tagline: 'Name the countries of today’s region against the clock.',
    emoji: '🗺️',
    accent: BLUE,
    quizMode: 'MAP',
  },
  {
    slug: 'name-them-all',
    name: 'Name Them All',
    tagline: 'Type every answer in the set from memory.',
    emoji: '📝',
    accent: TEAL,
    quizMode: 'CLASSIC',
  },
  {
    slug: 'multiple-choice',
    name: 'Multiple Choice',
    tagline: 'Pick the right answer, one question at a time.',
    emoji: '✅',
    accent: GREEN,
    quizMode: 'MULTIPLE_CHOICE',
  },
  {
    slug: 'find-it',
    name: 'Find It',
    tagline: 'Find each place on the map.',
    emoji: '📍',
    accent: INDIGO,
    quizMode: 'CLICKABLE',
  },
  {
    slug: 'picture-this',
    name: 'Picture This',
    tagline: 'Name what you see in each picture.',
    emoji: '🖼️',
    accent: ROSE,
    quizMode: 'PICTURE_BOX',
  },
  {
    slug: 'spot-it',
    name: 'Spot It',
    tagline: 'Click the right spot for each prompt.',
    emoji: '🎯',
    accent: VIOLET,
    quizMode: 'PICTURE_CLICK',
  },
  {
    slug: 'slideshow',
    name: 'Slideshow',
    tagline: 'Name each one as the slides advance.',
    emoji: '🎞️',
    accent: AMBER,
    quizMode: 'SLIDESHOW',
  },
  {
    slug: 'sort-it',
    name: 'Sort It',
    tagline: 'Sort every item into the right bucket.',
    emoji: '🗂️',
    accent: SLATE,
    quizMode: 'SORTABLE',
  },
  {
    slug: 'in-order',
    name: 'In Order',
    tagline: 'Put them in the correct sequence.',
    emoji: '🔢',
    accent: BLUE,
    quizMode: 'ORDER_UP',
  },
  {
    slug: 'world-capitals',
    name: 'World Capitals',
    tagline: 'Name the capital of each country.',
    emoji: '🏛️',
    accent: TEAL,
    quizMode: 'SLIDESHOW',
    topicFilter: 'World Capitals',
  },
  {
    slug: 'state-capitals',
    name: 'State Capitals',
    tagline: 'Name the capital of each US state.',
    emoji: '🦅',
    accent: INDIGO,
    quizMode: 'SLIDESHOW',
    topicFilter: 'US State Capitals',
  },
];

/** The standalone game islands + Flashcards. */
export const OTHER_GAMES: GameDef[] = [
  {
    slug: 'steps',
    name: 'Steps',
    tagline: 'Turn one word into another, one letter at a time.',
    emoji: '🪜',
    accent: AMBER,
  },
  {
    slug: 'acrostic',
    name: 'Acrostic',
    tagline: 'Solve the clues to spell a hidden word.',
    emoji: '📜',
    accent: VIOLET,
  },
  {
    slug: 'quizzle',
    name: 'Quizzle',
    tagline: 'Wager your confidence on every answer.',
    emoji: '🎲',
    accent: ROSE,
  },
  {
    slug: 'chess',
    name: 'Chess Attack',
    tagline: 'Solve the puzzle — checkmate in a few moves.',
    emoji: '♟️',
    accent: SLATE,
  },
  {
    slug: 'flashcards',
    name: 'Flashcards',
    tagline: 'Learn anything with a quick study session.',
    emoji: '🃏',
    accent: GREEN,
    href: '/discover',
  },
];

/** All games in shelf order: quiz types first, then the other islands. */
export const ALL_GAMES: GameDef[] = [...QUIZ_TYPE_GAMES, ...OTHER_GAMES];

/** The /daily/:slug recap route for a daily key (the localStorage key a play
 * screen records under). Quiz keys are "quizzes:<MODE>" or, for topic-filtered
 * games, "quizzes:<MODE>:<topic>"; islands are the slug itself. Used by the daily
 * guard to send a finished player back to the recap. */
export function dailyPathForKey(dailyKey: string): string {
  if (dailyKey.startsWith('quizzes:')) {
    const rest = dailyKey.slice('quizzes:'.length);
    const sep = rest.indexOf(':');
    const [mode, topic] =
      sep === -1 ? [rest, undefined] : [rest.slice(0, sep), rest.slice(sep + 1)];
    const g = QUIZ_TYPE_GAMES.find((q) => q.quizMode === mode && q.topicFilter === topic);
    return g ? `/daily/${g.slug}` : '/home';
  }
  const g = OTHER_GAMES.find((o) => o.slug === dailyKey);
  return g ? `/daily/${g.slug}` : '/home';
}
