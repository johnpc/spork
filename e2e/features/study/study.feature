Feature: Study a deck (authenticated, multiple choice)
  As a signed-in learner
  I want to answer multiple-choice questions
  So that spaced repetition auto-grades which cards are hard for me

  # Honest e2e + ADR-0004 guard: the study queue reads the deck's cards (public)
  # and the user's own UserCardReview rows (owner/userPool). This journey signs
  # in, opens a seeded deck, picks an option, and advances — asserting on real
  # rendered choices and a real progress advance, not just navigation.
  # Skips automatically when TEST_USERNAME / TEST_PASSWORD are unset.

  Scenario: A signed-in user answers a multiple-choice card
    Given the study test user signs in
    When the user starts studying the "Top Spanish Phrases" deck
    Then the study session shows progress "1 /"
    And four answer options are shown
    When the user picks an answer option
    Then answer feedback is shown
    When the user advances to the next card
    Then the study session advances past the first card

  Scenario: Finishing a session shows a score summary and counts toward the streak
    Given the study test user signs in
    When the user starts studying the "Top Spanish Phrases" deck
    And the user answers every card in the session
    Then a session score summary is shown
    When the user opens the You tab
    Then a study streak of at least 1 day is shown

  # Guest-first (ADR-0004): a signed-OUT visitor can study a deck end to end — no
  # account, no "add to my decks" — and see a score at the end. Reads the public
  # cards only; no userPool review call. Honest e2e on the real rendered flow.
  Scenario: A guest studies a whole deck and sees a score
    Given a guest opens the app
    When the user starts studying the "Top Spanish Phrases" deck
    Then the study session shows progress "1 /"
    When the user answers every card in the session
    Then a session score summary is shown
