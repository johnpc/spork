Feature: Play an Order Up quiz (arrange items in sequence)
  As a player
  I want to click items in the order I believe is correct against the clock
  So that I can prove I know the right sequence

  # Honest e2e: opens the seeded "Order these Space Race milestones" ORDER_UP quiz, starts the
  # timer, and clicks items. SEQUENCE scoring only counts the NEXT-expected item,
  # so clicking the earliest milestone first scores and flips that button to its
  # "placed" role on the REAL rendered list — not just a counter or navigation.

  Scenario: A guest arranges milestones in the correct order
    Given the player opens the "Order these Space Race milestones" order-up quiz
    When the player starts the order-up quiz
    And the player places the item "Sputnik 1 (first artificial satellite)"
    Then the order-up score shows "1"
    And the item "Sputnik 1 (first artificial satellite)" is marked placed
    When the player places the item "Laika (first animal to orbit Earth)"
    Then the order-up score shows "2"

  Scenario: An out-of-order click does not score
    Given the player opens the "Order these Space Race milestones" order-up quiz
    When the player starts the order-up quiz
    And the player places the item "Apollo 11 (first humans on the Moon)"
    Then the order-up score shows "0"
