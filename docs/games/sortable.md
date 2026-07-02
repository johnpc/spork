# Sortable — quiz type showcase

**Mode:** `SORTABLE` · **Input:** `arrange` · **Scoring:** `bucketing`

Drop each item into its correct bucket. Only a correct bucket scores (bucketing engine).

## Screenshot

Mid-play of the seeded **"Fruit or Vegetable?"** quiz:

![Sortable — Fruit or Vegetable?](https://files.jpc.io/d/1RWTd-spork-sortable.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/cBuOd-spork-sortable.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Sortable** is that same
data with the three axes set to `mode=SORTABLE`, `inputMode=arrange`, `scoringMode=bucketing` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `SORTABLE`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/sortable.ts`.
- **Acceptance test:** `e2e/features/play/sortable.feature` (asserts on real rendered play).
