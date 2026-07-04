Feature: Connections — group words by theme
  As a player
  I want to sort 16 words into 4 hidden themed groups
  So that I can find all the groups before running out of mistakes

  # Honest e2e against a seeded puzzle: select the 4 words of one known group,
  # submit, and assert on the rendered solved group (real data: theme + words).
  # Guest-playable, no auth.

  Scenario: A guest solves one group in a Connections puzzle
    Given the player opens a Connections puzzle
    When the player selects the words "apple", "banana", "cherry", "grape"
    And the player submits the selection
    Then a solved group is shown with the theme "Types of Fruit"

  Scenario: An incorrect group increases mistakes
    Given the player opens a Connections puzzle
    When the player selects the words "apple", "ocean", "gold", "hearts"
    And the player submits the selection
    Then the mistakes count increases
    And no solved group is shown

  Scenario: Losing the game reveals all 4 groups
    Given the player opens a Connections puzzle
    When the player makes 4 wrong guesses
    Then the reveal shows all 4 groups
    And the reveal includes the theme "Types of Fruit"
    And the reveal includes the words "apple, banana, cherry, grape"
