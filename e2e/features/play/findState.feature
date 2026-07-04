Feature: Find the US State (clickable US map)
  As a player
  I want the daily "Find the State" game to show a US map and score a correct click
  So that the CLICKABLE engine works on the US-states atlas, not just the world

  # Honest e2e: opens the game via its /daily/<slug> route (topic-filtered so it's
  # distinct from the world "Find It"), asserts the real rendered US map is shown,
  # then clicks the prompted state's region (FIPS id) and checks the score.

  Scenario: A guest opens the US map and clicks the first prompted state
    Given a visitor opens the "find-the-state" daily game
    Then the clickable US map is shown
    When the player clicks the region "01"
    Then the score shows "1"
    And the region "01" is marked found
