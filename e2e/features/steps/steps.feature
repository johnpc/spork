Feature: Steps — word ladder
  As a player
  I want to turn one word into another one letter at a time
  So that I can solve the ladder from start to target

  # Honest e2e against the seeded CAT → DOG ladder: play the real path
  # (cat→cot→cog→dog), asserting on the rendered ladder + the solved banner, and
  # confirm an invalid move is rejected with a reason. Guest-playable, no auth.

  Scenario: A guest solves the CAT to DOG ladder
    Given the player opens the "CAT → DOG" ladder
    When the player enters the word "cot"
    Then the ladder shows the word "COT"
    When the player enters the word "cog"
    And the player enters the word "dog"
    Then the ladder is solved

  Scenario: An invalid step is rejected
    Given the player opens the "CAT → DOG" ladder
    When the player enters the word "dog"
    Then a step error is shown
    And the ladder is not solved
