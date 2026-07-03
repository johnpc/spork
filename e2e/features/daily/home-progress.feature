Feature: Home shows the daily habit loop
  As a returning visitor
  I want Home to show what I've done today and my streak
  So that finishing the daily puzzles feels rewarding and worth coming back to

  # Honest e2e (guest-only, no account): we seed the device's daily-result store
  # exactly as finishing a puzzle would, then assert on the REAL rendered Home —
  # the per-card completion badge, the today tally, and the cross-game streak.

  Scenario: A finished game is badged and counted with a live streak
    Given the visitor has finished "quizzes:MAP" today with 5 out of 6
    And the visitor finished a puzzle yesterday
    When the visitor opens Home
    Then the Worldle card shows a completed badge of "5/6"
    And the daily tally shows 1 done
    And a daily streak of 2 is shown

  Scenario: A brand-new visitor sees no badges or streak
    When the visitor opens Home
    Then the daily tally shows 0 done
    And no daily streak is shown
