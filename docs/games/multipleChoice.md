# Multiple Choice — quiz type showcase

**Mode:** `MULTIPLE_CHOICE`  ·  **Input:** `pick`  ·  **Scoring:** `membership`

One question at a time; pick the correct option from the choices. A wrong pick is a no-op, a right one advances.

## Screenshot

Mid-play of the seeded **"World Capitals Quiz"** quiz:

![Multiple Choice — World Capitals Quiz](https://files.jpc.io/d/F3IMf-spork-multipleChoice.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/d0jtw-spork-multipleChoice.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Multiple Choice** is that same
data with the three axes set to `mode=MULTIPLE_CHOICE`, `inputMode=pick`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `MULTIPLE_CHOICE`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/multipleChoice.ts`.
- **Acceptance test:** `e2e/features/play/multipleChoice.feature` (asserts on real rendered play).
