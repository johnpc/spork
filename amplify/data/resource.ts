import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { generateDeckStarter } from '../deckgen/start/resource';
import { regenerateMedia } from '../deckgen/regenerate/resource';
import { generateQuizStarter } from '../quizgen/start/resource';

/**
 * SPORK data schema.
 *
 * Spork is a multi-game platform (see CLAUDE.md). Each game is an island of
 * models; the platform primitives (Category shelves, GenerationRun, UserStat)
 * are shared. Grows one vertical slice at a time (stoop's workflow).
 *
 * Auth: read models grant BOTH guest (signed-out browsing) AND authenticated
 * (identityPool + userPool) identities — guest-only would return empty results
 * once a user signs in (stoop ADR 0004). Writes are locked to the 'editors'
 * Cognito group; the seed runs as an editor and generation pipelines write via
 * their Lambda IAM roles straight to DynamoDB (bypassing AppSync). Per-user
 * models use owner authz.
 *
 * Games:
 * - Flashcards: Deck + Card (+ UserDeck, UserCardReview) — the flashstack app.
 * - Quizzes:    Quiz + Answer (+ UserQuizScore) — Sporcle-style, this slice
 *               ships MAP mode (template-backed, no LLM).
 */
const schema = a.schema({
  // Discover shelves — the source of truth for which category slugs surface as
  // browsable rows on the Discover tab, their labels, and their order. Decks
  // carry a denormalized `categorySlug` matching one of these.
  Category: a
    .model({
      name: a.string().required(),
      slug: a.string().required(),
      label: a.string(),
      sortOrder: a.integer().default(0),
    })
    // Look up a category by its stable slug (matches the deck categorySlug).
    .secondaryIndexes((index) => [index('slug')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']), // userPool: signed-in (incl. editors) can read
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // A flashcard deck. PUBLISHED decks surface in Discover under their category
  // shelf; DRAFT decks are in-progress admin generations (later slice). Card
  // fields the Discover grid needs (title, count, cover) are on the deck so the
  // shelf read is a single by-category GSI query with no per-deck card fetch.
  Deck: a
    .model({
      topic: a.string().required(), // the deck's display title, e.g. "Top 100 Spanish Phrases"
      categorySlug: a.string().required(),
      description: a.string(),
      voiceLanguage: a.string(), // BCP-47, drives Polly audio (later slice), e.g. "es-ES"
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      cardCount: a.integer().default(0),
      coverImagePath: a.string(), // S3 key under media/decks/, resolved via getUrl()
      publishedAt: a.datetime(),
      cards: a.hasMany('Card', 'deckId'),
    })
    // Discover read path: all decks in a category, newest first (sort client-side
    // on the bounded page). Querying the GSI beats a filtered list (full Scan).
    .secondaryIndexes((index) => [index('categorySlug')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One card in a deck. `ord` is its position; media paths are S3 keys resolved
  // via getUrl(). The study read path queries cards by deckId in `ord` order.
  Card: a
    .model({
      deckId: a.id().required(),
      deck: a.belongsTo('Deck', 'deckId'),
      ord: a.integer().required(),
      front: a.string().required(),
      back: a.string().required(),
      hint: a.string(),
      example: a.string(),
      imagePath: a.string(), // S3 key under media/decks/
      audioPath: a.string(), // S3 key under media/decks/
    })
    // Read all cards for a deck, ordered — the deck-detail + study read path.
    .secondaryIndexes((index) => [index('deckId').sortKeys(['ord'])])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // A user's saved deck ("My Decks"). Per-user, so owner-based authz (userPool):
  // every row is scoped to its creator's Cognito identity — a user only reads
  // and writes their own. Card fields are denormalized so the list renders
  // without a per-row Deck fetch (mirrors stoop's UserSavedPost). Read/write
  // these with the userPool authMode or the owner rule returns empty (ADR 0004).
  UserDeck: a
    .model({
      deckId: a.id().required(),
      topic: a.string().required(),
      categorySlug: a.string(),
      cardCount: a.integer().default(0),
      coverImagePath: a.string(),
      addedAt: a.datetime(),
    })
    // Per-user lookup of a deck's saved state, scoped by owner at the row level.
    .secondaryIndexes((index) => [index('deckId')])
    .authorization((allow) => [allow.owner()]),

  // Per-(user, card) SM-2 spaced-repetition state. Per-user, owner authz
  // (userPool) — a user only reads/writes their own reviews. The play session
  // queries this user's due reviews for a deck via the deckId(dueAt) GSI, then
  // merges with the deck's Cards (untracked card = new). On each self-grade the
  // client computes sm2() and upserts the row. Read/write with userPool auth or
  // the owner rule returns empty (ADR 0004).
  UserCardReview: a
    .model({
      cardId: a.id().required(),
      deckId: a.id().required(),
      easeFactor: a.float().default(2.5),
      intervalDays: a.integer().default(0),
      repetitions: a.integer().default(0),
      dueAt: a.datetime().required(),
      lastGrade: a.integer(),
      lastReviewedAt: a.datetime(),
    })
    // The due-cards read path: this user's reviews for a deck, soonest-due first.
    .secondaryIndexes((index) => [index('deckId').sortKeys(['dueAt'])])
    .authorization((allow) => [allow.owner()]),

  // A user's study streak. Per-user, owner authz (userPool): one row per user,
  // updated after each session. `lastStudiedDate` is a YYYY-MM-DD day stamp
  // (not a timestamp) so the streak math is by calendar day; `current`/`longest`
  // are the running + best consecutive-day counts. Mastery is NOT stored here —
  // it's derived live from UserCardReview (repetitions), so it's always accurate.
  UserStat: a
    .model({
      currentStreak: a.integer().default(0),
      longestStreak: a.integer().default(0),
      lastStudiedDate: a.string(),
      totalReviews: a.integer().default(0),
    })
    .authorization((allow) => [allow.owner()]),

  // ─── Quizzes game ──────────────────────────────────────────────────────────
  // A quiz is the published unit (Deck analogue). Every Sporcle-style type is
  // this one model described by THREE ORTHOGONAL AXES (see CLAUDE.md):
  //   • mode        → which RENDERER draws the board (RENDERERS[mode]).
  //   • inputMode   → HOW the player answers: type / pick / click / arrange.
  //   • scoringMode → what "correct" means: membership (find them all) /
  //                   sequence (Order Up) / bucketing (Sortable) /
  //                   elimination (Minefield — one miss ends the run).
  // `renderConfig` is a small JSON blob for mode-specific view config (MAP:
  // {topology,projection}; GRID: {columns}; SLIDESHOW: {}, …). `timeLimitSeconds`
  // is engine config. Adding a type = a renderer + these fields, never a reschema.
  Quiz: a
    .model({
      topic: a.string().required(), // display title, e.g. "Countries of the World"
      categorySlug: a.string().required(),
      description: a.string(),
      mode: a.enum([
        'CLASSIC',
        'MAP',
        'PICTURE_BOX',
        'MULTIPLE_CHOICE',
        'CLICKABLE',
        'PICTURE_CLICK',
        'SLIDESHOW',
        'SORTABLE',
        'ORDER_UP',
      ]),
      inputMode: a.enum(['TYPE', 'PICK', 'CLICK', 'ARRANGE']),
      scoringMode: a.enum(['MEMBERSHIP', 'SEQUENCE', 'BUCKETING', 'ELIMINATION']),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      answerCount: a.integer().default(0),
      timeLimitSeconds: a.integer().default(300),
      renderConfig: a.string(), // JSON; mode-specific view config
      coverImagePath: a.string(),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily puzzle
      answers: a.hasMany('Answer', 'quizId'),
    })
    // Discover read path + the daily read path (one quiz per YYYY-MM-DD).
    .secondaryIndexes((index) => [index('categorySlug'), index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One accepted answer in a quiz (Card analogue) — the UNIVERSAL Sporcle row.
  // Every quiz shape is this same shape with two axes swapped (see CLAUDE.md):
  //   • promptKind/promptValue = HOW the player is prompted for this answer:
  //       NONE   → open list (name the presidents); no prompt shown
  //       TEXT   → a clue string (promptValue = "The Beatles")
  //       IMAGE  → a media key (promptValue = S3 key of a flag/poster)
  //       REGION → an SVG region id (promptValue = numeric ISO for a map)
  //       CELL   → a fixed grid coordinate (promptValue = "r3c5" periodic table)
  //   • groupKey = ties several rows to one prompt (a "foursome": 1 clue → 4 rows)
  // `display` is the canonical label shown when found; `accepted` is a JSON array
  // of accepted spellings — the play client normalizes typed input + these and
  // set-matches, needing no reference data. The engine keys the found set by the
  // answer's id; each renderer maps its prompt → id. So a new quiz type is a new
  // renderer over this one model, never a reschema.
  Answer: a
    .model({
      quizId: a.id().required(),
      quiz: a.belongsTo('Quiz', 'quizId'),
      ord: a.integer().required(),
      promptKind: a.enum(['NONE', 'TEXT', 'IMAGE', 'REGION', 'CELL']),
      promptValue: a.string(), // clue text / media key / region id / cell coord
      groupKey: a.string(), // groups rows under one prompt (foursomes); null = flat
      display: a.string().required(),
      accepted: a.string().required(), // JSON string[] of accepted spellings
      hint: a.string(),
      // Type-specific extras (all nullable — the universal row absorbs them):
      options: a.string(), // MULTIPLE_CHOICE/CLICKABLE: JSON string[] of choices shown
      orderIndex: a.integer(), // ORDER_UP: this answer's correct position in the sequence
      bucket: a.string(), // SORTABLE: the correct bucket/category label for this item
    })
    // Read all answers for a quiz, ordered — the play read path.
    .secondaryIndexes((index) => [index('quizId').sortKeys(['ord'])])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // NOTE: the Quizzes game is GUEST-ONLY (no account needed to play or save a
  // score). A quiz is a timed session, so the player's best score is kept on the
  // device in localStorage (see src/games/quizzes/play/bestScoreStore.ts), NOT
  // in a per-user model — there is no UserQuizScore. If accounts arrive later, a
  // synced best-score model can be added then (don't model ahead of a UI).

  // ─── Steps game (word ladder) ────────────────────────────────────────────
  // A DISTINCT game, not a quiz mode: transform `start` into `target` one letter
  // at a time, every intermediate a real word. This model owns none of the quiz
  // machinery — its own engine validates single-letter steps against `dictionary`
  // (the JSON set of allowed words for THIS puzzle). `parPath` is a known
  // solution (JSON string[]) used for par length + a hint. Guest-only, same read/
  // editor authz as the other published content.
  WordLadder: a
    .model({
      start: a.string().required(),
      target: a.string().required(),
      dictionary: a.string().required(), // JSON string[] of allowed words (normalized lowercase)
      parPath: a.string().required(), // JSON string[] — a known start→target solution
      difficulty: a.enum(['EASY', 'MEDIUM', 'HARD']),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily ladder
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Acrostic game ───────────────────────────────────────────────────────
  // Solve short clues; each answer's letters drop into a shared quote grid,
  // revealing the hidden `quote` a little at a time. `clues` is JSON: an array
  // of { clue, answer } (answers concatenated spell the quote's letters in
  // order). `author` optional attribution. Its own engine — no quiz machinery.
  Acrostic: a
    .model({
      title: a.string().required(),
      quote: a.string().required(), // the full quote revealed on completion
      author: a.string(),
      clues: a.string().required(), // JSON [{clue, answer}] — answers spell the quote letters
      difficulty: a.enum(['EASY', 'MEDIUM', 'HARD']),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily acrostic
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Quizzle game ────────────────────────────────────────────────────────
  // A pub-quiz where you WAGER confidence on each answer before revealing it —
  // right answers earn the wager, wrong ones lose it. `questions` is JSON: an
  // array of { question, answer, accepted[] }. Its own wager-scoring engine.
  Quizzle: a
    .model({
      topic: a.string().required(),
      questions: a.string().required(), // JSON [{question, answer, accepted[]}]
      startingBank: a.integer().default(1000),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily quizzle
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Chess Attack game ───────────────────────────────────────────────────
  // A mate-in-N puzzle on a small board. `fen`-like `position` (JSON: pieces +
  // side to move) and `solution` (JSON string[] of moves in coordinate
  // notation). Its own board engine validates legal moves + checks the solution.
  ChessAttack: a
    .model({
      name: a.string().required(),
      position: a.string().required(), // JSON board state {board, toMove}
      solution: a.string().required(), // JSON string[] of moves, e.g. ["c1c3","a1a3"]
      movesToWin: a.integer().default(1),
      difficulty: a.enum(['EASY', 'MEDIUM', 'HARD']),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily chess puzzle
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Wordle game ─────────────────────────────────────────────────────────
  // Guess a hidden N-letter word in `maxGuesses` tries; each guess is scored
  // per-letter green/yellow/gray. A DISTINCT game, not a quiz mode. The row
  // carries only the `answer` (lowercase) + board config — the allowed-guess
  // dictionary is a client-bundled fixture (the same ~thousands of words every
  // day), so rows stay tiny and daily selection is a deterministic word pick
  // (no LLM). Guest-only, same read/editor authz as other published content.
  WordlePuzzle: a
    .model({
      answer: a.string().required(), // the solution, normalized lowercase
      wordLength: a.integer().default(5),
      maxGuesses: a.integer().default(6),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily word
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Connections game ────────────────────────────────────────────────────
  // Sort 16 words into 4 hidden themed groups of 4; a wrong group of 4 costs a
  // mistake, 4 mistakes ends it. LLM-generated (like Acrostic/Quizzle): `groups`
  // is JSON [{ theme, words:[4], level:0-3 }] (level 0=easiest .. 3=trickiest);
  // the 16 tiles are the flattened, shuffled words. Its own grouping engine — no
  // quiz machinery. Guest-only, same read/editor authz.
  ConnectionsPuzzle: a
    .model({
      groups: a.string().required(), // JSON [{theme, words:[4], level}] — 4 groups of 4
      maxMistakes: a.integer().default(4),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily connections
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // ─── Spelling Bee game ───────────────────────────────────────────────────
  // Make as many words (≥4 letters) as you can from 7 letters, each word must
  // use the required `centerLetter`; a word using all 7 is a pangram. A DISTINCT
  // game, not a quiz mode. The full valid-word set (`answers`) is computed once
  // at generation/seed time from the bundled dictionary (no per-guess network),
  // so the client scores locally. Guest-only, same read/editor authz.
  SpellingBeePuzzle: a
    .model({
      letters: a.string().required(), // the 7 usable letters (normalized lowercase, no order)
      centerLetter: a.string().required(), // the one letter every word must use
      answers: a.string().required(), // JSON string[] — every valid word for this board
      pangrams: a.string(), // JSON string[] — the subset using all 7 letters
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      publishedAt: a.datetime(),
      puzzleDate: a.string(), // YYYY-MM-DD — the day this is the daily bee
    })
    .secondaryIndexes((index) => [index('puzzleDate')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One generation run — the admin dashboard reads these (stoop's SyncRun
  // analogue). Serves every game: `game` says which island, `mode` distinguishes
  // template-backed (e.g. MAP quizzes — synchronous, no LLM) from generative
  // runs. `deckId`/`quizId` point at whichever unit the run produced. The
  // starter creates a RUNNING (or directly DRAFT_READY, for template runs) row;
  // a worker flips it to DRAFT_READY or FAILED.
  GenerationRun: a
    .model({
      game: a.enum(['FLASHCARDS', 'QUIZZES']),
      mode: a.string(), // quiz mode (MAP/TYPING/...) or null for flashcards
      topic: a.string().required(),
      categorySlug: a.string().required(),
      voiceLanguage: a.string(),
      requestedCount: a.integer().default(0),
      generatedCount: a.integer().default(0),
      deckId: a.id(),
      quizId: a.id(),
      status: a.enum(['RUNNING', 'DRAFT_READY', 'FAILED']),
      statusReason: a.string(),
      startedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // Admin-initiated deck generation. Returns a runId immediately; the starter
  // Lambda creates the GenerationRun + a DRAFT Deck, then async-invokes the
  // worker (Bedrock cards -> per-card image+audio -> write cards). Editors only.
  generateDeck: a
    .mutation()
    .arguments({
      topic: a.string().required(),
      categorySlug: a.string().required(),
      cardCount: a.integer().required(),
      voiceLanguage: a.string().required(),
    })
    .returns(a.customType({ runId: a.string().required(), deckId: a.string().required() }))
    .authorization((allow) => [allow.group('editors')])
    .handler(a.handler.function(generateDeckStarter)),

  // Admin-initiated quiz generation. Returns { runId, quizId } immediately. The
  // starter FORKS on `mode`: template-backed modes (MAP) build the answer set
  // from shipped topology + a canonical table and write everything synchronously
  // (no Bedrock/worker); generative modes async-invoke a worker (Bedrock). For
  // template modes `topicOrTemplate` names the template (e.g. "world-countries").
  // Editors only.
  generateQuiz: a
    .mutation()
    .arguments({
      mode: a.string().required(),
      topicOrTemplate: a.string().required(),
      categorySlug: a.string().required(),
      timeLimitSeconds: a.integer().required(),
      answerCount: a.integer(), // generative modes: how many answers to ask Claude for
    })
    .returns(a.customType({ runId: a.string().required(), quizId: a.string().required() }))
    .authorization((allow) => [allow.group('editors')])
    .handler(a.handler.function(generateQuizStarter)),

  // Regenerate one card's image or audio (admin edit action). Synchronous —
  // a single Bedrock/Polly call, well under the resolver timeout. Editors only.
  regenerateCardMedia: a
    .mutation()
    .arguments({ cardId: a.id().required(), kind: a.string().required() })
    .returns(a.customType({ path: a.string().required() }))
    .authorization((allow) => [allow.group('editors')])
    .handler(a.handler.function(regenerateMedia)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
