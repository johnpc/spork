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

### PR titles (what shipped, not the backstory)

The **title** names the feature added, bug fixed, or behavior changed — plainly, from the reader's
point of view. It's a conventional-commit line: `type(scope): what changed`. All context — the phase
you're on, what you proved vs. guessed, issues closed, rationale — belongs in the **description**,
never the title.

- **No development narrative in the title.** Strip "Phase 1 / 2b", "proven not guessed", internal
  framing. The reader doesn't know or care which phase of your plan this was.
- **No issue-number soup** (`(#86, #85)`) — reference issues in the body (`Closes #86`).
- Write for someone scanning the merged history who's never seen your plan.

Good: `feat(quizzes): fill in the world map as you name each country` ·
`fix(play): accept accented country spellings ("Côte d'Ivoire")`
Junky (avoid): `feat(quizzes): map mode Phase 2a (#12, #13)`

### PR demo artifacts (screenshot or video of the new feature)

When a PR changes anything a user can **see or interact with** (a screen, component, flow, visual or
state change), the PR description MUST include a screenshot or short video of it working. Skip it
only for changes with no visible surface — pure backend/pipeline logic, refactors, config, docs,
tests-only.

Generate the artifact from the slice's own acceptance test — don't stage a throwaway:

- **Video (preferred for a flow):** the slice already has a Gherkin `.feature`. Playwright records a
  video per test with `use: { video: 'on' }` (or `'retain-on-failure'`); the `.webm` lands under
  `test-results/`. Run the one scenario (`npx playwright test <path> -g "<scenario>"`) and grab it.
- **Screenshot (enough for a static change):** `await page.screenshot({ path: '...' })` in the step.

Upload to `files.jpc.io` and paste the direct URL into the PR description — a `.webm`/`.mp4`/`.png`/
`.gif` URL renders inline in the GitHub PR body. All `aws` calls use **`AWS_PROFILE=personal`**; never
inline keys.

> **`https://files.jpc.io/d/<name>` is a PERMANENT URL.** `files.jpc.io` is a Next.js server that
> re-generates a fresh presigned S3 link on every render, so a `curl -I` on it returns a **307 redirect
> to a short-lived presigned S3 URL** — that expiry is on the _redirect target_, not the `/d/` link. Do
> NOT mistake the 307 for a broken/expiring link and fall back to committing media into the repo; the
> `/d/` URL keeps working indefinitely. (For MP4, GitHub renders it inline as a `<video>` player.)

```bash
FILE_PATH="test-results/<…>/video.webm"   # or your screenshot .png
FILENAME=$(basename "$FILE_PATH")
HASH=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5)
AWS_PROFILE=personal aws s3 cp "$FILE_PATH" \
  "s3://amplify-d1wnjkkkrwiiql-mai-imagehostbucketaac3bfe7-aark0f5h8nw8/public/public/${HASH}-${FILENAME}" \
  --region us-west-2
echo "Paste into the PR description: https://files.jpc.io/d/${HASH}-${FILENAME}"
```

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
- **Map mode is TEMPLATE-BACKED, not LLM-generated.** The map topology _is_ the answer set, so
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

### Guest-first (the Quizzes game needs no account)

**The Quizzes game is guest-only** — no sign-in to browse, play, or save a score. A quiz is a timed
session, so the player's best score lives on the **device in localStorage**
(`src/games/quizzes/play/bestScoreStore.ts`), not in a per-user model. Don't add auth gates or
owner-scoped models to Quizzes; if synced accounts arrive later, add a best-score model then (don't
model ahead of a UI). The inherited Flashcards game still has its own auth/owner models — that's
existing surface, not a pattern to copy into new games.

### Amplify auth contract (client mode ↔ schema rule MUST match)

A request is authorized only when the **client `authMode`** and the model's **`allow.*` rule** name
the **same provider**. Mismatches return `Unauthorized` / empty results, not a loud error. Guest
reads work only when the model grants `allow.guest()` AND the client sends `identityPool` — which is
the default in `src/lib/dataClient.ts`, so guest play "just works" as long as new read models keep
the guest grant.

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

## Design

- **Style only via design tokens.** Consume the `--sp-*` CSS variables and role classes
  (`.sp-heading`, `.sp-kicker`, `.sp-muted`, `.sp-card-face`) from `src/theme/variables.css` —
  **never hardcoded hex/px** in feature CSS. This is what keeps a new game visually consistent with
  the platform for free.
- **Don't invent parallel visual patterns** — extend the tokens/role classes. A new game's surface
  should read as part of Spork, not a bolt-on. Game-specific colors (e.g. map region fills) still
  come from tokens (`--sp-correct`, `--sp-accent-soft`, …), not literals.

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
— never just a URL or element visibility. For the guest-only Quizzes game that means asserting on the
actual rendered map/answers (e.g. a region gains the `sp-region--found` class after a correct guess),
not just that a counter changed. For any flow that still signs in (Flashcards), wait for the Cognito
session before reading data — navigating immediately races the session and reads as a guest, which
silently passes.

## Definition of done

A slice is done only when **all** of these hold:

1. `npm run quality` green locally (pre-commit enforces it on commit).
2. Gherkin acceptance scenarios + colocated unit tests added and passing.
3. Backend deployed + seeded if any Amplify model changed.
4. Conventional commit, branch pushed, PR open, **CI green**.
5. PR description includes a **demo artifact** (screenshot/video) for any user-visible change — see
   [PR demo artifacts](#pr-demo-artifacts-screenshot-or-video-of-the-new-feature).

## Commands

```bash
npm run dev            # Vite dev server
npm run quality        # full local gate: lint + format + check:lines + check:features + coverage + crap + build
npm run format         # Prettier write (run before committing)
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run seed           # seed Discover categories + starter games (idempotent; needs editor creds)
npm run gen:map-template  # rebuild the world-countries map fixture (topology ↔ ISO ↔ aliases)
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

## Decisions

Significant, hard-to-reverse choices are recorded here (add a line when you make one; expand into
`docs/decisions/` if a choice needs its full rationale). Read these before re-opening a settled
question.

- **Guest-only Quizzes.** No account to play or save a score; best scores are per-device
  (localStorage). Removes auth from the whole game surface. Revisit only if synced/social scores are
  wanted.
- **Map quizzes are template-backed, not LLM-generated.** The topology is the answer set; answers are
  reconciled once at build time (`npm run gen:map-template`) from world-atlas + i18n-iso-countries
  into a committed fixture, so neither the Lambda nor the client bundles country-reference packages.
- **Generation forks at the starter, not the worker.** Template modes (MAP) complete synchronously
  with no Bedrock; generative modes async-invoke a worker. Keeps the cheap/deterministic path off the
  LLM entirely.
- **One engine, N renderers.** The play engine (found-set + timer + score) is mode-agnostic; a mode
  is a renderer + a `renderConfig` payload, never a schema change.
