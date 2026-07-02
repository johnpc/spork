# Clickable — quiz type showcase

**Mode:** `CLICKABLE` · **Input:** `click` · **Scoring:** `membership`

Click the correct tiles out of a mixed grid. Decoy tiles never score; correct tiles fill in.

## Screenshot

Mid-play of the seeded **"Click the African Countries"** quiz:

![Clickable — Click the African Countries](https://files.jpc.io/d/jSUtq-spork-clickable.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/0SwNR-spork-clickable.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Clickable** is that same
data with the three axes set to `mode=CLICKABLE`, `inputMode=click`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `CLICKABLE`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/clickable.ts`.
- **Acceptance test:** `e2e/features/play/clickable.feature` (asserts on real rendered play).
