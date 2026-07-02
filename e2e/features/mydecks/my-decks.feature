Feature: My Decks (authenticated)
  As a signed-in learner
  I want to save decks to my library
  So that I can come back and study them

  # Honest e2e + ADR-0004 guard: owner-authz rows only return data on the
  # userPool auth path. This journey signs in, adds a deck, and reads it back
  # from "My Decks" — asserting on the real saved row, not just navigation.
  # Skips automatically when TEST_USERNAME / TEST_PASSWORD are unset.

  Scenario: A signed-in user adds a deck and sees it in My Decks
    Given the test user signs in
    When the test user opens the "Top Spanish Phrases" deck
    And the test user adds the deck to My Decks
    Then the deck button shows it is in My Decks
    When the test user opens the My Decks tab
    Then "Top Spanish Phrases" is listed in My Decks
    And the Due Today panel reflects the saved deck's due cards
