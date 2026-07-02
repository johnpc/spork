import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { generateDeckStarter } from '../deckgen/start/resource';
import { regenerateMedia } from '../deckgen/regenerate/resource';

/**
 * SPORK data schema.
 *
 * Grows one vertical slice at a time (stoop's workflow). Read models grant BOTH
 * guest (signed-out browsing) AND authenticated (identityPool + userPool)
 * identities — guest-only would return empty results once a user signs in (see
 * stoop ADR 0004). Writes are locked to the 'editors' Cognito group; the seed
 * runs as an editor and the deck-gen pipeline writes via its Lambda IAM roles
 * straight to DynamoDB (bypassing AppSync). Per-user models use owner authz.
 *
 * Slice 1 (Discover shelves): Category.
 * Slice 2 (Discover decks): Deck + Card — published decks listed under shelves.
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

  // One AI deck-generation run — the admin dashboard reads these (stoop's
  // SyncRun analogue). The starter mutation creates a RUNNING row; the worker
  // flips it to DRAFT_READY (deck filled, awaiting edit/publish) or FAILED.
  GenerationRun: a
    .model({
      topic: a.string().required(),
      categorySlug: a.string().required(),
      voiceLanguage: a.string(),
      requestedCount: a.integer().default(0),
      generatedCount: a.integer().default(0),
      deckId: a.id(),
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
