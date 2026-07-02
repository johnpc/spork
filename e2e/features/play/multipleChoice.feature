Feature: Play a multiple-choice quiz (pick the correct answer)
  As a player
  I want to pick the correct option for each question against the clock
  So that I can test my knowledge one question at a time

  # Honest e2e: opens the seeded "World Capitals Quiz" MULTIPLE_CHOICE quiz, starts
  # the timer, and clicks REAL rendered option buttons. Asserts on rendered seeded
  # data — the score increments and the question advances after a correct pick,
  # and a wrong pick does not score — not just navigation.

  Scenario: A guest plays the multiple-choice quiz and scores a correct pick
    Given the player opens the "World Capitals Quiz" multiple-choice quiz
    When the player starts the quiz
    Then the current question is "What is the capital of France?"
    When the player picks the option "Paris"
    Then the score shows "1"
    And the current question is "What is the capital of Japan?"

  Scenario: A wrong pick does not score
    Given the player opens the "World Capitals Quiz" multiple-choice quiz
    When the player starts the quiz
    And the player picks the option "Lyon"
    Then the score shows "0"
    And the current question is "What is the capital of France?"
