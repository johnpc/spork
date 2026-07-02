# Spork

**Spork is a stack of little brain games** — a single app that hosts many small games (Quizzes,
Flashcards, and later Acrostic, Quizzle, Chess Attack, …), several of them AI-generated. The
platform (auth, home, profile, streaks, the generation pipeline, the admin dashboard, the whole
quality/CI rig) is shared; each **game** is a self-contained island that plugs into it.

Architecture, quality bar, and toolchain descend from the **stoop** app (`~/repo/stoop`) via
**flashstack** (`~/repo/flashstack`, the Flashcards game's original home) — when a pattern is unclear
here, those are the reference implementations.

## How we work together (read this first)

The person directing you may be **non-technical** — an "idea guy" who owns the **product**. They
define **WHAT**: features, intent, and Gherkin acceptance scenarios. **You own the HOW**:
architecture, code quality, testing, and every technical decision below.

- **Never ask them to make a technical call.** Don't surface coverage numbers, CRAP, lint,
  file-length, library choices, or schema design as questions. Decide them yourself, to the
  standards in this file, silently.
- **Translate vague ideas into Gherkin.** When they describe a feature, propose concrete `.feature`
  scenarios (Given/When/Then) and confirm those — that's the spec you build to.
- **Only escalate genuine _product_ questions** — ambiguous behavior, scope, copy, what a screen
  should do. Everything technical is yours.

## Workflow: specs-first vertical slices

Every feature ships as one **thin vertical slice** — UI + hook + API + backend model + tests, just
enough for the scenario, nothing speculative.

1. **Spec first.** Write/confirm Gherkin scenarios in `e2e/features/<slice>/*.feature`, steps in
   `e2e/steps/`.
2. **Scaffold backend only as the slice needs it** — add Amplify models + seed in `amplify/` for
   exactly this slice's read patterns; don't model ahead of a UI that uses it.
3. **Implement to pass the spec** — follow the architecture and file conventions below.
4. **Run the full quality gate** (`npm run quality`) and get it green locally.
5. **Deploy + seed** the backend if it changed (`npx ampx sandbox`, `npm run seed`).
6. **Conventional commit, push, CI green.** Open a PR; CI blocks the merge.

## Stack

- **Client:** Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor (iOS via SPM).
- **Backend:** AWS Amplify Gen2 — Cognito auth + AppSync (GraphQL) + DynamoDB. Lives in `amplify/`.
- **AI:** Bedrock Claude (tool-forced structured output for generated content), Bedrock Stability
  (images), Amazon Polly (audio).

## Platform vs. Games — the core structure

Spork is a **shell + game islands**. Keep the seam sharp: platform code knows nothing about any
specific game; a game knows only the platform contracts it plugs into.

- **Platform (shared, `src/features/*`, `src/lib/*`):** auth, the Spork **Home** (lists games and
  routes into them), profile, streaks (`UserStat`), the Discover shelf pattern, the AI **generation
  pipeline** shape, the admin/generation dashboard, the tab bar, design tokens, the quality/CI rig.
- **Games (`src/games/<game>/`):** each owns its models, its play/study surface, its own generation
  branch, and its Gherkin specs. Games in flight / planned:
  - **Flashcards** — decks/cards, spaced-repetition study (the original flashstack app, kept intact).
  - **Quizzes** — Sporcle-style: a set of accepted answers, type/click to reveal them against a
    timer. See the engine+renderer design below.
  - **Acrostic, Quizzle, Chess Attack, …** — future islands, same seams.

**Adding a game = a new island, not a rewrite.** A new game adds its models to the schema, a
`generate<Game>` mutation (if AI-generated) following the pipeline pattern, a `src/games/<game>/`
feature tree, a Home entry, and its specs. It reuses platform auth, streaks, and the generation
pipeline; it does not fork them.

### The Quizzes game: one engine, N renderers, ∞ data

The Quizzes game is itself data-driven the same way the platform is game-driven:

- **The engine is mode-agnostic:** a set of accepted answers (each with normalized `accepted`
  spellings + a `display` label) → normalize input → match against the remaining set → mark found →
  timer → score. Identical across every quiz mode. Lives in `src/games/quizzes/play/` as pure
  helpers (`normalize`, `buildAliasIndex`, `matchAnswer`, `scoreState`, `tickTimer`) + a `usePlay`
  hook orchestrating found-set + timer + score.
- **Modes differ only by RENDERER** — a swappable view bound to the same found-set, chosen by
  `Quiz.mode` from a `RENDERERS` registry: `MAP` (color an SVG region), `TYPING`/`GRID` (fill slots),
  `MULTIPLE_CHOICE`, `ORDERED`. The input box, timer HUD, and score are mode-shared.
- **Map mode is TEMPLATE-BACKED, not LLM-generated.** The map topology *is* the answer set, so
  Claude would only hallucinate geometry/ISO codes. Map quizzes derive their answers from a shipped
  topojson (`world-atlas`) + a canonical ISO table (`i18n-iso-countries`) + a small curated alias
  fixture — reconciled **once at generation**, so the play client needs zero country-reference deps.
  Generative modes (typing/MC/grid/ordered) use the Bedrock path. **The generation pipeline branches
  by mode at the starter:** template modes complete synchronously (no Bedrock/worker); generative
  modes async-invoke the worker.

## Architecture (platform primitives)

- **`Category`** owns the Discover shelves (which category slugs surface, their order and labels).
- Each game has a **published unit** + its **items**:
  - Flashcards: **`Deck`** (published) → **`Card`** (front/back/hint/example/image/audio), carrying a
    denormalized `categorySlug`.
  - Quizzes: **`Quiz`** (published; `mode`, `timeLimitSeconds`, `renderConfig` JSON, `categorySlug`)
    → **`Answer`** (`ord`, `regionId` for spatial modes, `display`, normalized `accepted[]`, `hint`).
- **`GenerationRun`** records one AI/template generation (admin dashboard) — the `SyncRun` analogue
  from stoop; carries `mode` so the dashboard shows template vs generative runs.
- Per-user state is owner-scoped: Flashcards **`UserDeck`** + **`UserCardReview`** (SM-2); Quizzes
  **`UserQuizScore`** (best found/total per quiz — a session score, NOT spaced repetition); platform
  **`UserStat`** (streak).
- The **generation pipeline** is admin-initiated (`generate<Game>` custom mutations, editors group).
  Generative branch → Step Functions: Claude writes items → optional per-item media → write the
  published unit + items as DRAFT → admin edits/publishes. Template branch (e.g. map quizzes) →
  synchronous starter, no LLM. Lambdas write straight to DynamoDB via their IAM roles (bypassing
  AppSync), mirroring stoop's ingestion.

### Amplify auth contract (client mode ↔ schema rule MUST match)

A request is authorized only when the **client `authMode`** and the model's **`allow.*` rule** name
the **same provider**. Mismatches return `Unauthorized` / empty results, not a loud error.

- The data client (`src/lib/dataClient.ts`) defaults to **`identityPool`**; `readAuthMode()` upgrades
  signed-in users to **`userPool`** (group claims ride in the JWT).
- Read models grant guest + `authenticated('identityPool')` + `authenticated()` (userPool) reads, and
  `group('editors')` writes.
- Per-user models use `allow.owner()` (userPool) — read/write these with the userPool authMode.
- Editor writes (seed, authoring) use `authMode: 'userPool'`; the seed signs in as an editor.

### Code organization (vertical slices)

Platform features live under `src/features/<feature>/`; game code under `src/games/<game>/<slice>/`.
Tests are colocated. Same file conventions everywhere:

- **`useX.ts`** — hooks hold all logic/orchestration; client state via Context + Hook + Provider.
- **`xApi.ts`** — all server state through react-query (`useQuery`/`useMutation`) wrapping the
  Amplify client. No server fetches in components.
- **`X.tsx`** — components only render.
- **`x.ts`** helpers — pure functions for non-trivial logic (unit-testable, keeps files short).
- **`X.css`** — consume `--sp-*` design tokens / role classes from `src/theme/variables.css`.

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

Run `npm run quality` for the full set. **Enforce them yourself; when one fails, fix the code, never
the gate.** Scope covers both `src/` and `amplify/` LOGIC; only declarative files are exempt
(`amplify/**/resource.ts`, `amplify/backend.ts`, `amplify/**/fixtures/**`).

- **No `any`, ever.** ESLint `@typescript-eslint/no-explicit-any: error`.
- **Every `.ts`/`.tsx` logic file ≤ 100 lines** (`npm run check:lines`). Over → extract a helper.
  Never raise the limit.
- **≥ 80% coverage** on every logic file. Fix by writing tests — never exclusions.
- **CRAP ≤ 15 per function** (`npm run crap`).
- **Acceptance tests are always Gherkin** (`.feature` + steps), run via Playwright + playwright-bdd.
- **Build must pass** (`npm run build`). **Format clean** (Prettier).
- **Determinism:** pure helpers take injected randomness/time (shuffle fn, elapsed ms) — no bare
  `Math.random()`/`Date.now()` in logic under test.

### Honest e2e

Every data-reading flow must be exercised at least once asserting on **rendered real (seeded) data**
— never just a URL or element visibility. After signing in, wait for the Cognito session before
reading data.

## Commands

```bash
npm run dev            # Vite dev server
npm run quality        # full local gate: lint + format + check:lines + check:features + coverage + crap + build
npm run format         # Prettier write (run before committing)
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run seed           # seed Discover categories + starter games (idempotent; needs editor creds)
npm run e2e-config     # pull amplify_outputs.json from the sandbox stack
npx ampx sandbox       # personal cloud backend sandbox
```

## Key facts

- **Repo:** `johnpc/spork`.
- **iOS/Android bundle id:** `com.johncorser.spork`. Region `us-west-2`, AWS profile `personal`.
- **Sandbox stack:** set on first `npx ampx sandbox`, then wire into `package.json` `e2e-config`.
- **CI:** `.github/workflows/ci.yml` (quality + Gherkin acceptance matrix, one area per feature/game)
  blocks PRs. `ios-deploy.yml` / `android-deploy.yml` publish after CI on `main`. Secrets:
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TEST_USERNAME`, `TEST_PASSWORD`, `ASC_KEY_ID`,
  `ASC_ISSUER_ID`, `ASC_KEY_CONTENT`, `TEAM_ID`.

## Conventions

- **Conventional commits** (`feat:`, `fix:`, `chore:`, `ci:`, `docs:` …).
- Keep logic out of view components. Throwaway scripts go in `/tmp`, not the repo.
- **Keep the platform/game seam sharp** — no game-specific logic in platform code; no platform
  forking inside a game.
