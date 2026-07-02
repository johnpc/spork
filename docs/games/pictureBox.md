# Picture Box — quiz type showcase

**Mode:** `PICTURE_BOX`  ·  **Input:** `type`  ·  **Scoring:** `membership`

Identify each image by typing its name; a correct guess reveals that picture's label.

## Screenshot

Mid-play of the seeded **"Guess the NBA Player"** quiz:

![Picture Box — Guess the NBA Player](https://files.jpc.io/d/Yw9Y1-spork-pictureBox.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/6HCWk-spork-pictureBox.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Picture Box** is that same
data with the three axes set to `mode=PICTURE_BOX`, `inputMode=type`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `PICTURE_BOX`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/pictureBox.ts`.
- **Acceptance test:** `e2e/features/play/pictureBox.feature` (asserts on real rendered play).
