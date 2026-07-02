Feature: Play a map quiz (name the countries)
  As a player
  I want to type country names against the clock and see them fill in on a map
  So that I can test how many of the world's countries I can name

  # Honest e2e: this journey opens the seeded "World Countries" MAP quiz, starts
  # the timer, types real country names, and asserts the score increments AND the
  # matching region fills in on the real rendered SVG map — not just navigation.
  # The Quizzes game is GUEST-ONLY: no account to play or to save a score. Best
  # scores persist per-device (localStorage), so the persistence scenario just
  # reopens the quiz as the same guest and re-reads the saved best.

  Scenario: A guest plays the world map quiz and scores correct answers
    Given the player opens the "World Countries" map quiz
    When the player starts the quiz
    And the player types the answer "Brazil"
    Then the score shows "1"
    And the region for "Brazil" is filled in on the map
    When the player types the answer "United States"
    Then the score shows "2"
    When the player types the answer "Narnia"
    Then the score shows "2"

  Scenario: Lenient matching accepts aliases and accented spellings
    Given the player opens the "World Countries" map quiz
    When the player starts the quiz
    And the player types the answer "USA"
    Then the score shows "1"
    When the player types the answer "cote divoire"
    Then the score shows "2"

  Scenario: Finishing shows a score summary
    Given the player opens the "World Countries" map quiz
    When the player starts the quiz
    And the player types the answer "Brazil"
    And the player gives up
    Then a quiz score summary is shown

  Scenario: A guest's best score persists on the device
    Given the player opens the "World Countries" map quiz
    When the player starts the quiz
    And the player types the answer "Brazil"
    And the player types the answer "Canada"
    And the player gives up
    Then a quiz score summary is shown
    When the player reopens the "World Countries" map quiz
    Then a saved best score of at least 2 is shown
