Feature: Chess Attack — capture puzzle
  As a player
  I want to solve a small-board capture puzzle by moving pieces
  So that I can capture the black king by following the solution

  # Honest e2e against the seeded "Rook Takes All" puzzle: tap the white rook
  # then the black king's square to play the real capture, asserting on the
  # moved piece + the solved banner. A wrong first move is rejected with "try
  # again". Guest-playable, no auth.

  Scenario: A guest solves a one-move capture puzzle
    Given the player opens the "Rook Takes All" puzzle
    When the player taps square "a1"
    And the player taps square "a5"
    Then the piece on square "a5" is shown
    And the puzzle is solved

  Scenario: A wrong move is rejected
    Given the player opens the "Rook Takes All" puzzle
    When the player taps square "a1"
    And the player taps square "a2"
    Then a try-again message is shown
    And the puzzle is not solved
