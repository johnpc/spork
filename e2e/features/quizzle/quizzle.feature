Feature: Quizzle — wager pub-quiz
  As a player
  I want to wager against a bank on each answer
  So that confident answers grow my bank and I chase a high final score

  # Honest e2e against the seeded "World Geography" quizzle: play a real question,
  # wager, answer correctly, and assert the bank grows on the rendered screen.
  # Guest-playable, no auth. Content matches the committed AI-generated fixture
  # (amplify/seed/fixtures/quizzle.ts).

  Scenario: A guest plays a seeded quizzle to a winning bank
    Given the player opens the "World Geography" quizzle
    When the player starts the quizzle
    And the player wagers "500"
    And the player answers "Nile"
    Then the answer is marked correct
    And the bank shows "1500"

  Scenario: A wrong answer reveals the correct answer
    Given the player opens the "World Geography" quizzle
    When the player starts the quizzle
    And the player wagers "100"
    And the player answers "Amazon"
    Then the quizzle reveals the answer "Nile"
    And the bank shows "900"
