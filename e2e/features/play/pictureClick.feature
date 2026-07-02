Feature: Play a picture-click quiz (click the right spot)
  As a player
  I want to read a prompt and click the matching spot on a diagram
  So that I can test whether I know where each labeled region is

  # Honest e2e: this journey opens the seeded "Compass Rose" PICTURE_CLICK quiz,
  # starts the timer, clicks a hotspot by its accessible label, and asserts the
  # score increments AND that hotspot becomes a rendered "found" spot showing its
  # label — not just navigation. The Quizzes game is GUEST-ONLY.

  Scenario: A guest clicks the correct hotspots and scores them
    Given the player opens the "Compass Rose" picture-click quiz
    When the player starts the picture-click quiz
    And the player clicks the "Northwest" hotspot
    Then the picture-click score shows "1"
    And the "Northwest" hotspot is marked found on the diagram
    When the player clicks the "Northeast" hotspot
    Then the picture-click score shows "2"

  Scenario: Finishing shows a score summary
    Given the player opens the "Compass Rose" picture-click quiz
    When the player starts the picture-click quiz
    And the player clicks the "Northwest" hotspot
    And the player gives up the picture-click quiz
    Then a picture-click score summary is shown
