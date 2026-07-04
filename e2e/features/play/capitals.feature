Feature: Capitals games (World / US State) via the daily entry
  As a player
  I want the daily State Capitals and World Capitals games to open their own
  topic-filtered SLIDESHOW quiz and accept a typed capital
  So that two games sharing the SLIDESHOW mode stay distinct by topic

  # Honest e2e: opens each game through its /daily/<slug> route (exercising the
  # topicFilter that keeps them separate from the generic Slideshow game), then
  # asserts on the REAL seeded slide + that a correct capital scores.

  Scenario: State Capitals opens its own quiz and accepts a capital
    Given a visitor opens the "state-capitals" daily game
    Then a slideshow quiz is shown
    When the player starts the quiz
    And the player answers the capital prompt correctly
    Then the score shows "1"

  Scenario: World Capitals opens its own quiz and accepts a capital
    Given a visitor opens the "world-capitals" daily game
    Then a slideshow quiz is shown
    When the player starts the quiz
    And the player answers the capital prompt correctly
    Then the score shows "1"

  Scenario: Skipping a capital moves to the next prompt without scoring
    Given a visitor opens the "world-capitals" daily game
    Then a slideshow quiz is shown
    When the player starts the quiz
    And the player skips the current prompt
    Then a different prompt is shown
    And the score shows "0"
