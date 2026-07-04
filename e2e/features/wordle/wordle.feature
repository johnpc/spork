Feature: Wordle — guess the word
  As a player
  I want to guess a 5-letter word in 6 tries
  So that I can solve the daily Wordle puzzle

  # Honest e2e against the seeded "crane" puzzle: the first seed answer is
  # deterministic. Type the correct answer, see all tiles turn green + win state.
  # Guest-playable, no auth.

  Scenario: A guest wins by guessing the word
    Given the player opens the first Wordle puzzle
    When the player types "crane"
    And the player submits the guess
    Then all tiles in the last guess are green
    And the win message is shown

  Scenario: An invalid word is rejected
    Given the player opens the first Wordle puzzle
    When the player types "zzzzz"
    And the player submits the guess
    Then an error message is shown
    And the guess count remains 0
