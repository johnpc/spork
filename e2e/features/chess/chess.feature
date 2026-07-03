Feature: Chess Attack — mate-in-N puzzle
  As a player
  I want to deliver checkmate by playing the forced solution
  So that I solve a real chess mate puzzle (the defender replies too)

  # Honest e2e against the seeded "Forced Mate (mate in 1)" puzzle: it's Black to
  # move and 1...Qh2# is mate (queen d6→h2). Tap the queen then h2, asserting on
  # the moved piece + the checkmate banner. A wrong first move is rejected with
  # "try again". Guest-playable, no auth.

  Scenario: A guest delivers a one-move checkmate
    Given the player opens the "Forced Mate (mate in 1)" puzzle
    When the player taps square "d6"
    And the player taps square "h2"
    Then the piece on square "h2" is shown
    And the puzzle is solved

  Scenario: A wrong move is rejected
    Given the player opens the "Forced Mate (mate in 1)" puzzle
    When the player taps square "d6"
    And the player taps square "d4"
    Then a try-again message is shown
    And the puzzle is not solved
