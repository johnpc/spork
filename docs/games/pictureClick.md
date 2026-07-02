# Picture Click — quiz type showcase

**Mode:** `PICTURE_CLICK` · **Input:** `click` · **Scoring:** `membership`

Given a prompt, click the right spot on an image/diagram. The matching hotspot scores.

## Screenshot

Mid-play of the seeded **"Compass Rose: Click the Direction"** quiz:

![Picture Click — Compass Rose: Click the Direction](https://files.jpc.io/d/nzHO0-spork-pictureClick.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/4TkL0-spork-pictureClick.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Picture Click** is that same
data with the three axes set to `mode=PICTURE_CLICK`, `inputMode=click`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `PICTURE_CLICK`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/pictureClick.ts`.
- **Acceptance test:** `e2e/features/play/pictureClick.feature` (asserts on real rendered play).
