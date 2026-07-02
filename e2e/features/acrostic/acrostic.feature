Feature: Acrostic — hidden-quote word puzzle
  As a player
  I want to solve short clues
  So that I can reveal a hidden quote a little at a time

  # Honest e2e against the seeded "Keep Going" puzzle (a Confucius quote). Solve
  # every clue, asserting on the rendered progress and the solved banner +
  # author. Guest-playable, no auth. Content matches the committed AI-generated
  # fixture (amplify/seed/fixtures/acrostic.ts).

  Scenario: A guest solves the Keep Going acrostic
    Given the player opens the "Keep Going" acrostic
    Then the acrostic progress is "0 / 6 solved"
    When the player answers clue 0 with "ice"
    Then the acrostic progress is "1 / 6 solved"
    When the player answers clue 1 with "HORSE"
    And the player answers clue 2 with "sun"
    And the player answers clue 3 with "ocean"
    And the player answers clue 4 with "day"
    And the player answers clue 5 with "tree"
    Then the acrostic is solved
    And the acrostic quote is attributed to "Confucius"

  Scenario: A wrong answer is rejected
    Given the player opens the "Keep Going" acrostic
    When the player answers clue 0 with "zzz"
    Then the acrostic is not solved
