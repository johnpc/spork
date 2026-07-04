Feature: Play a multiple-choice quiz (pick the correct answer)
  As a player
  I want to pick the correct option for each question
  So that I can test my knowledge one question at a time

  # Honest e2e: opens the seeded "Capital Cities" MULTIPLE_CHOICE quiz and clicks
  # REAL rendered option buttons. The quiz auto-starts on the first pick. Asserts
  # on rendered seeded data — the score increments and the question advances
  # after a correct pick, and a wrong pick does not score.

  Scenario: A guest plays the multiple-choice quiz and scores a correct pick
    Given the player opens the "Capital Cities" multiple-choice quiz
    When the player starts the quiz
    Then the current question is "What is the capital of Australia?"
    When the player picks the option "Canberra"
    Then the score shows "1"
    And the current question is "What is the capital of Canada?"

  Scenario: A wrong pick does not score
    Given the player opens the "Capital Cities" multiple-choice quiz
    When the player starts the quiz
    And the player picks the option "Sydney"
    Then the score shows "0"

  Scenario: Giving up reveals all correct answers
    Given the player opens the "Capital Cities" multiple-choice quiz
    When the player starts the quiz
    And the player picks the option "Canberra"
    And the player gives up
    Then a quiz score summary is shown
    And the correct answer "Tokyo" is revealed
