# Steps — word ladder (game showcase)

**Steps** is Spork's second first-class game — and the proof that the platform carries _genuinely
distinct_ games, not just quiz modes. Transform a **start** word into a **target** word one letter at
a time; every intermediate must be a real word.

## Screenshot

Mid-solve of the seeded **CAT → DOG** ladder:

![Steps — CAT to DOG](https://files.jpc.io/d/GAxCc-spork-steps.png)

## Demo

A guest solves it end to end (recorded from the Gherkin acceptance test against a live seeded
backend):

https://files.jpc.io/d/iLTm2-spork-steps.mp4

## Why it proves the platform seam

Steps shares **nothing** with the Quizzes engine — no found-set, no answer matching, no timer. Its
engine (`src/games/steps/play/ladder.ts`) is a pure single-letter-diff + dictionary check. What it
_does_ share is the platform: the guest-first Home shelf, the `--sp-*` design tokens, routing, and
the quality/CI rig.

- **Model:** `WordLadder` (`start`, `target`, `dictionary`, `parPath`) — its own island in the schema.
- **Engine:** `ladder.ts` — `oneLetterApart` + `checkStep` + `isSolved`, pure and unit-tested.
- **Play:** `src/games/steps/play/` (`useLadder` hook + `Steps` renderer + `StepInput`/`LadderPath`).
- **Acceptance test:** `e2e/features/steps/steps.feature` (asserts on the real rendered ladder).

Adding it touched **no** Quizzes or Flashcards code — a new game is a new island, exactly as the
architecture promises.
