Feature: Acrostic — spell the hidden word
  As a player
  I want to solve short clues whose initials spell a hidden word
  So that I reveal the secret word (and a quote about it) letter by letter

  # Honest e2e against the seeded "The Deep Blue" puzzle — the answers' initials
  # spell OCEAN, revealing a Jacques Cousteau quote on completion. Solve every
  # clue, asserting on the rendered progress and the solved banner + author.
  # Guest-playable, no auth. Content matches the committed AI-generated fixture
  # (amplify/seed/fixtures/acrostic.ts).

  Scenario: A guest solves the OCEAN acrostic
    Given the player opens the "The Deep Blue" acrostic
    Then the acrostic progress is "0 / 5 solved"
    When the player answers clue 0 with "orange"
    Then the acrostic progress is "1 / 5 solved"
    When the player answers clue 1 with "CALF"
    And the player answers clue 2 with "elephant"
    And the player answers clue 3 with "apple"
    And the player answers clue 4 with "night"
    Then the acrostic is solved
    And the acrostic quote is attributed to "Jacques Cousteau"

  Scenario: A wrong answer is rejected
    Given the player opens the "The Deep Blue" acrostic
    When the player answers clue 0 with "zzz"
    Then the acrostic is not solved
