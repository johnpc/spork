Feature: Unknown URLs land on a friendly 404
  As a visitor who followed a stale or mistyped link
  I want a clear dead-end back to the games
  So that I never hit a blank white screen

  # Honest e2e (guest-only): navigate to a route that matches nothing and assert
  # on the REAL rendered 404 screen and that its link points home.

  Scenario: A nonexistent route shows the 404 screen
    When the visitor opens an unknown URL
    Then the not-found screen is shown
    And it offers a link back to the games
