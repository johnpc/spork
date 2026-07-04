Feature: Spelling Bee — word puzzle
  As a player
  I want to find words using 7 letters with one required center letter
  So that I can score points and find pangrams

  # Honest e2e against the first seeded board (letters=abdeiou, center=o).
  # We know "abode" is a valid answer from the fixture generation log.
  # Guest-playable, no auth.

  Scenario: A guest finds a valid word
    Given the player opens the first Spelling Bee puzzle
    When the player types the word "abode"
    And the player submits the word
    Then the word "ABODE" appears in the found list
    And the score increases

  Scenario: An invalid word is rejected
    Given the player opens the first Spelling Bee puzzle
    When the player types the word "bad"
    And the player submits the word
    Then an error is shown

  Scenario: Giving up reveals missed words
    Given the player opens the first Spelling Bee puzzle
    When the player types the word "abode"
    And the player submits the word
    And the player gives up the bee
    Then the reveal shows missed words including "ABODED"
    And the reveal shows the count of found words
