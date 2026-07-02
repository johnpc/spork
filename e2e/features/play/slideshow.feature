Feature: Play a slideshow quiz (name the artist for each album)
  As a player
  I want to be shown one album prompt at a time and type the artist
  So that a correct answer reveals it and advances the deck to the next slide

  # Honest e2e: opens the seeded "Name the Artist" SLIDESHOW quiz, starts the
  # timer, and types real artists. Asserts on REAL rendered slide data — slides
  # are ordered alphabetically by artist (no orderIndex), so AC/DC's "Back in
  # Black" comes first — then that the deck ADVANCES after a correct answer and
  # the score increments — not just navigation.

  Scenario: A guest names artists and the deck advances slide by slide
    Given the player opens the "Name the Artist" slideshow quiz
    Then the slide prompt shows "Back in Black"
    When the player starts the quiz
    And the player types the answer "AC/DC"
    Then the score shows "1"
    And the slide prompt shows "21"
    When the player types the answer "Adele"
    Then the score shows "2"
    And the slide prompt shows "Rumours"

  Scenario: A wrong artist does not advance the deck or score
    Given the player opens the "Name the Artist" slideshow quiz
    When the player starts the quiz
    And the player types the answer "Not An Artist"
    Then the score shows "0"
    And the slide prompt shows "Back in Black"
