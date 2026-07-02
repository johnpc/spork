# Order Up — quiz type showcase

**Mode:** `ORDER_UP` · **Input:** `arrange` · **Scoring:** `sequence`

Arrange items into the correct sequence. Only the next-expected item scores (sequence engine).

## Screenshot

Mid-play of the seeded **"Space Race Timeline"** quiz:

![Order Up — Space Race Timeline](https://files.jpc.io/d/iWaiX-spork-orderUp.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/eIeHf-spork-orderUp.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Order Up** is that same
data with the three axes set to `mode=ORDER_UP`, `inputMode=arrange`, `scoringMode=sequence` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `ORDER_UP`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/orderUp.ts`.
- **Acceptance test:** `e2e/features/play/orderUp.feature` (asserts on real rendered play).
