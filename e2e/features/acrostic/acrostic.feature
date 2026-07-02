Feature: Acrostic — hidden-quote word puzzle
  As a player
  I want to solve short clues
  So that I can reveal a hidden quote a little at a time

  # Honest e2e against the seeded "On Trying" puzzle (quote: Do or do not, there
  # is no try — Yoda). Solve every clue, asserting on the rendered progress, the
  # revealed clue answers, and the solved banner + author. Guest-playable, no auth.

  Scenario: A guest solves the On Trying acrostic
    Given the player opens the "On Trying" acrostic
    Then the acrostic progress is "0 / 3 solved"
    When the player answers clue 0 with "cat"
    Then the acrostic progress is "1 / 3 solved"
    When the player answers clue 1 with "ICE"
    And the player answers clue 2 with "earth"
    Then the acrostic is solved
    And the acrostic quote is attributed to "Yoda"

  Scenario: A wrong answer is rejected
    Given the player opens the "On Trying" acrostic
    When the player answers clue 0 with "dog"
    Then the acrostic is not solved
