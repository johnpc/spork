# Slideshow — quiz type showcase

**Mode:** `SLIDESHOW` · **Input:** `type` · **Scoring:** `membership`

One prompt per slide; a correct typed answer reveals it and advances the deck slide by slide.

## Screenshot

Mid-play of the seeded **"Name the Artist"** quiz:

![Slideshow — Name the Artist](https://files.jpc.io/d/xsP2d-spork-slideshow.png)

## Demo

A guest plays it end to end (recorded from this type's Gherkin acceptance test against a live seeded backend):

https://files.jpc.io/d/1kYvi-spork-slideshow.mp4

## How it fits the model

Spork stores every quiz as one `Quiz` + a list of universal `Answer` rows. **Slideshow** is that same
data with the three axes set to `mode=SLIDESHOW`, `inputMode=type`, `scoringMode=membership` — no
new table, no new engine.

- **Renderer:** `src/games/quizzes/play/` (registered in `renderers.ts` under `SLIDESHOW`).
- **Seed fixture:** `amplify/seed/fixtures/quizzes/slideshow.ts`.
- **Acceptance test:** `e2e/features/play/slideshow.feature` (asserts on real rendered play).
