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

  # Uses a DIFFERENT deck than the scenario above: both run as the same test user
  # under fullyParallel, and SM-2 converts a graded card out of the shared "new"
  # set — so sharing one deck lets the two sessions steal each other's due cards
  # ("All caught up!"). Separate decks keep each session's queue independent.
  # The streak save is fire-and-forget after the last card. Closing or reloading
  # the app right then used to drop it. Here the save is cut off and the app
  # reloads immediately with no wait: the You tab must still show the streak
  # (from the local outbox), and the next launch must replay it to the server.
  # One scenario, not two: both would write the same test user's single stat row.
  Scenario: Finishing a session counts toward the streak even if the app reloads right away
    Given the study test user signs in
    When the user starts studying the "Greek Gods" deck
    And the streak save will be cut off
    And the user answers every card in the session
    Then a session score summary is shown
    When the app reloads immediately
    And the user opens the You tab
    Then a study streak of at least 1 day is shown
    And the streak is saved on the server

  # Guest-first (ADR-0004): a signed-OUT visitor can study a deck end to end — no
  # account, no "add to my decks" — and see a score at the end. Reads the public
  # cards only; no userPool review call. Honest e2e on the real rendered flow.
  Scenario: A guest studies a whole deck and sees a score
    Given a guest opens the app
    When the user starts studying the "Top Spanish Phrases" deck
    Then the study session shows progress "1 /"
    When the user answers every card in the session
    Then a session score summary is shown

  # A failed deck read must offer a retry, not a false "Deck not found" — the
  # gateway to Study. Fails only the deck's card query so the deck row still loads.
  Scenario: A failed deck read shows a retry, not a false not-found
    Given a guest opens the "Top Spanish Phrases" deck with its card read failing
    Then the deck shows a retry, not a not-found message

  # A failed study load must offer a retry, not a false "All caught up!".
  Scenario: A failed study load shows a retry, not a false all-caught-up
    Given a guest opens the "Top Spanish Phrases" study session with the card read failing
    Then the study session shows a retry, not an all-caught-up message
