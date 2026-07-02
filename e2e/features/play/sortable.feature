Feature: Play a sortable quiz (sort items into buckets)
  As a player
  I want to place each item into its correct category against the clock
  So that I can test whether I know which group each item belongs to

  # Honest e2e: this journey opens the seeded "Fruit or Vegetable?" SORTABLE quiz,
  # starts the timer, selects a real seeded item, clicks a real bucket column, and
  # asserts the score increments AND the sorted item leaves the unsorted list —
  # asserting on rendered seeded data, not just navigation. Quizzes are GUEST-ONLY.

  Scenario: A guest sorts an item into the correct bucket and scores
    Given the player opens the "Fruit or Vegetable?" sortable quiz
    When the player starts the sortable quiz
    And the player selects the item "Banana"
    And the player drops it into the "Fruit" bucket
    Then the sortable score shows "1"
    And the item "Banana" is no longer in the unsorted list

  Scenario: Dropping an item into the wrong bucket does not score
    Given the player opens the "Fruit or Vegetable?" sortable quiz
    When the player starts the sortable quiz
    And the player selects the item "Carrot"
    And the player drops it into the "Fruit" bucket
    Then the sortable score shows "0"
    And the item "Carrot" is still in the unsorted list
