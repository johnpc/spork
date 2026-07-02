Feature: Quizzle — wager pub-quiz
  As a player
  I want to wager against a bank on each answer
  So that confident answers grow my bank and I chase a high final score

  # Honest e2e against the seeded "World Capitals" quizzle: play a real question,
  # wager, answer correctly, and assert the bank grows on the rendered screen —
  # then confirm the final-bank screen shows a win. Guest-playable, no auth.

  Scenario: A guest plays a seeded quizzle to a winning bank
    Given the player opens the "World Capitals" quizzle
    When the player starts the quizzle
    And the player wagers "500"
    And the player answers "Paris"
    Then the answer is marked correct
    And the bank shows "1500"
