Feature: Play a classic list quiz (name the hidden list)
  As a player
  I want to type answers against the clock and watch them pop into a hidden list
  So that I can test how many items of a known set I can recall

  # Honest e2e: opens the seeded "US Presidents of the 2000s" CLASSIC quiz, starts
  # the timer, types a real answer, and asserts BOTH the score increments AND the
  # matching slot reveals its real display label on the rendered list — not just
  # navigation. CLASSIC is a typed-input mode using the shared PlayInput. The
  # Quizzes game is GUEST-ONLY: no account to play.

  Scenario: A guest names a president and the slot fills in
    Given the player opens the "US Presidents of the 2000s" classic quiz
    When the player starts the classic quiz
    And the player types the classic answer "Obama"
    Then the classic score shows "1"
    And the classic slot for "Barack Obama" is revealed

  Scenario: An unknown guess does not score
    Given the player opens the "US Presidents of the 2000s" classic quiz
    When the player starts the classic quiz
    And the player types the classic answer "Obama"
    Then the classic score shows "1"
    And the player types the classic answer "Napoleon"
    Then the classic score shows "1"
