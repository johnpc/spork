Feature: Full journey — author a deck, then discover & study it
  As the whole product
  I want an editor-authored deck to flow all the way to a learner studying it
  So that gaps between stages (like a published deck with no Discover shelf)
  are caught by one end-to-end test

  # This is the catch-all that would have caught the missing-category bug:
  # publishing a deck is NOT enough — it must actually surface in Discover under
  # its category section and be studyable. Asserts real data at each stage.
  # Skips when TEST_USERNAME / TEST_PASSWORD are unset.

  Scenario: An editor publishes a deck and a learner finds and studies it
    # --- Author (editor) ---
    Given the journey editor signs in
    When the editor creates and fills a deck in "languages"
    And the editor publishes that deck
    # --- Discover (the gap-catcher: it must appear under its category) ---
    Then the deck appears in the "Languages" section on Discover
    # --- Study ---
    When the learner opens that deck and studies it
    Then the learner can reveal and grade a card
