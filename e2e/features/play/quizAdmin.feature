Feature: Quiz Studio — generate a quiz with AI and publish it
  As an editor
  I want to generate a quiz from a topic and publish the draft
  So that the AI-authored quiz appears in the public Quizzes list

  # Honest e2e: signs in as an editor, opens Quiz Studio, kicks off a real
  # CLASSIC generation (Bedrock), waits for the run to reach DRAFT_READY, then
  # publishes the draft and confirms it surfaces in the guest Quizzes list.
  # Editor-gated + calls the live LLM, so it skips when TEST_USERNAME/PASSWORD
  # are unset. Uses a unique topic per run so assertions target this quiz.

  Scenario: An editor generates a Classic quiz and publishes it
    Given the editor opens Quiz Studio
    When the editor generates a "CLASSIC" quiz about a unique topic
    Then the generation run reaches DRAFT_READY
    And the generated quiz appears as a draft
    When the editor publishes the generated draft
    Then the published quiz appears in the Quizzes list
