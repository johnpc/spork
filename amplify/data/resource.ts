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
  // A quiz is the published unit (Deck analogue). `mode` selects the play
  // renderer; the engine (accepted-answer set + timer + score) is identical
  // across modes. `renderConfig` is a small JSON blob for mode-specific view
  // config (MAP: {topology, projection}; GRID: {columns}; null otherwise) — so
  // adding a mode is a renderer + payload, never a reschema. `timeLimitSeconds`
  // is engine config. Same read/editor authz as Deck.
  Quiz: a
    .model({
      topic: a.string().required(), // display title, e.g. "Countries of the World"
      categorySlug: a.string().required(),
      description: a.string(),
      mode: a.enum(['MAP', 'TYPING', 'GRID', 'MULTIPLE_CHOICE', 'ORDERED']),
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      answerCount: a.integer().default(0),
      timeLimitSeconds: a.integer().default(300),
      renderConfig: a.string(), // JSON; mode-specific view config
      coverImagePath: a.string(),
      publishedAt: a.datetime(),
      answers: a.hasMany('Answer', 'quizId'),
    })
    // Discover read path: all quizzes in a category (mirrors Deck).
    .secondaryIndexes((index) => [index('categorySlug')])
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
