Feature: Play a clickable quiz (click the correct tiles)
  As a player
  I want to click the correct tiles out of a grid against the clock
  So that I can prove I know which items belong to the set

  # Honest e2e: this journey opens the seeded "Click the African Countries"
  # CLICKABLE quiz, starts the timer, clicks a real seeded correct tile and a
  # decoy tile, and asserts on the RENDERED grid — a clicked correct tile gains
  # the "found" role and the score increments, while a decoy never scores — not
  # just navigation. The Quizzes game is GUEST-ONLY (no account to play).

  Scenario: A guest clicks correct tiles and scores them
    Given the player opens the "Click the African Countries" clickable quiz
    When the player starts the clickable quiz
    And the player clicks the tile "Egypt"
    Then the score shows "1"
    And the tile "Egypt" is marked found
    When the player clicks the tile "Kenya"
    Then the score shows "2"

  Scenario: Clicking a decoy tile does not score
    Given the player opens the "Click the African Countries" clickable quiz
    When the player starts the clickable quiz
    And the player clicks the tile "Egypt"
    Then the score shows "1"
    When the player clicks the tile "Brazil"
    Then the score shows "1"

  Scenario: Finishing shows a score summary
    Given the player opens the "Click the African Countries" clickable quiz
    When the player starts the clickable quiz
    And the player clicks the tile "Egypt"
    And the player gives up on the clickable quiz
    Then a clickable score summary is shown
