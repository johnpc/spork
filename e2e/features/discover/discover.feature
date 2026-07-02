Feature: Discover sections
  As a visitor opening SPORK
  I want to see flashcard decks organized into collapsible category sections
  So that I can browse what's available without drilling in

  # Honest e2e (stoop rule): assert on REAL seeded data (named categories + a
  # named deck from the seed), not just that the page rendered. This proves the
  # guest read path returns categories AND their decks. The app root lands on the
  # Spork game shelf (/home); Discover is the flashcard-browsing tab.

  Scenario: The app root lands on the Spork game shelf
    Given a visitor opens the app at the root
    Then they are taken to the games home

  Scenario: A visitor opens Discover and sees the seeded category sections
    Given a visitor opens Discover
    And a category section "Languages" is visible
    And a category section "Myths & Legends" is visible

  Scenario: Expanding a section previews its published decks inline
    Given a visitor opens Discover
    When they expand the "Languages" section
    Then a deck titled "Top Spanish Phrases" is visible
