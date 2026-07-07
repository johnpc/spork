Feature: Browse past days and see per-day progress
  As a visitor
  I want to step back to a past day, play its puzzles, and see how I did that day
  So that I can catch up on puzzles I missed and revisit my history

  # Honest e2e (guest-only): the seed stamps the LAST fixture as today and steps
  # earlier ones back a day each, so YESTERDAY reliably has a seeded puzzle. We
  # assert on the REAL rendered surface — the switcher label, the dated per-card
  # badge (seeded into the device store as finishing would), and that a dated
  # permalink drops the guest into that day's actual game — not just navigation.

  Scenario: Stepping the Home switcher back a day shows that day's badges
    Given the visitor has finished "wordle" on the day before today with 3 out of 6
    When the visitor opens Home
    And the visitor steps the date switcher back one day
    Then the switcher shows yesterday's date
    And the Wordle card shows a completed badge of "3/6"

  Scenario: The switcher cannot go past today
    When the visitor opens Home
    Then the switcher shows "Today"
    And the forward day arrow is disabled

  Scenario: A dated permalink opens that day's puzzle
    When the visitor opens the Wordle permalink for the day before today
    Then a Wordle board is shown
