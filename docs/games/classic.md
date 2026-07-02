# Classic — quiz type showcase

**Mode:** `CLASSIC`  ·  **Input:** `type`  ·  **Scoring:** `membership`

Type answers to reveal a hidden list — each correct guess pops into its slot. The archetypal Sporcle format.

## Screenshot

Mid-play of the seeded **"US Presidents of the 2000s"** quiz:

![Classic — US Presidents of the 2000s](https://files.jpc.io/d/NLTVl-spork-classic.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/RCEGQ-spork-classic.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Classic** is that same
data with the three axes set to `mode=CLASSIC`, `inputMode=type`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `CLASSIC`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/classic.ts`.
- **Acceptance test:** `e2e/features/play/classic.feature` (asserts on real rendered play).
