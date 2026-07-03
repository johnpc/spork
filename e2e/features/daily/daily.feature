Feature: Daily puzzles — one of each type per day
  As a visitor
  I want each quiz type to be its own daily game on the home shelf
  So that a Map puzzle and an Order Up puzzle feel like different games

  # Honest e2e: the Spork home shows a distinct card per quiz TYPE. Opening a
  # type's daily route resolves TODAY'S puzzle of exactly that mode and drops the
  # guest straight into it — asserting on the real rendered game surface, not
  # just navigation. Guest-only, no account.

  Scenario: Worldle opens today's Map puzzle
    Given a visitor opens the "worldle" daily game
    Then the world map is shown

  Scenario: In Order opens today's Order Up puzzle
    Given a visitor opens the "in-order" daily game
    Then the order-up board is shown
