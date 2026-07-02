Feature: Play a picture-box quiz (name the pictures)
  As a player
  I want to type names for a grid of AI-generated pictures against the clock
  So that I can test how many landmarks I can identify

  # Honest e2e: this journey opens the seeded "Guess the World Landmark"
  # PICTURE_BOX quiz (AI-generated landmark images), starts the timer, types a
  # real landmark name, and asserts BOTH that the score increments AND that the
  # matching picture tile reveals its real label in the rendered grid — not just
  # navigation.

  Scenario: A guest names pictures and reveals their labels
    Given the player opens the "Guess the World Landmark" picture-box quiz
    When the player starts the picture-box quiz
    And the player names the picture "Eiffel Tower"
    Then the picture-box score shows "1"
    And the picture labelled "Eiffel Tower" is revealed
    When the player names the picture "taj mahal"
    Then the picture-box score shows "2"
    When the player names the picture "Not A Landmark"
    Then the picture-box score shows "2"

  Scenario: Finishing shows a score summary
    Given the player opens the "Guess the World Landmark" picture-box quiz
    When the player starts the picture-box quiz
    And the player names the picture "Eiffel Tower"
    And the player gives up on the picture-box quiz
    Then a picture-box score summary is shown
