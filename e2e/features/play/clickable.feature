Feature: Play a clickable quiz (find the country on the map)
  As a player
  I want to be prompted for a country and click it on the map against the clock
  So that I can prove I know where each country is

  # Honest e2e: this journey opens the seeded "Find the African Countries"
  # CLICKABLE quiz (now a find-it-on-the-map game). It clicks the real seeded map
  # region for the prompted country and asserts on the RENDERED map — the clicked
  # region gains the "found" role and the score increments, while clicking the
  # wrong country never scores — not just navigation. Click modes auto-start on
  # the first interaction (no Start button). The Quizzes game is GUEST-ONLY.

  Scenario: A guest clicks the prompted country and scores it
    Given the player opens the "Find the African Countries" clickable quiz
    When the player clicks the region "818"
    Then the score shows "1"
    And the region "818" is marked found

  Scenario: Clicking the wrong country does not score
    Given the player opens the "Find the African Countries" clickable quiz
    When the player clicks the region "566"
    Then the score shows "0"

  Scenario: Finishing shows a score summary
    Given the player opens the "Find the African Countries" clickable quiz
    When the player clicks the region "818"
    And the player gives up on the clickable quiz
    Then a clickable score summary is shown
