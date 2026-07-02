import { describe, it, expect } from 'vitest';
import { gradeForChoice, GRADE_CORRECT, GRADE_WRONG } from './answerGrade';

describe('gradeForChoice', () => {
  it('grades a correct pick as a pass', () => {
    expect(gradeForChoice('Hello', 'Hello')).toBe(GRADE_CORRECT);
  });

  it('grades a wrong pick as a lapse', () => {
    expect(gradeForChoice('Bye', 'Hello')).toBe(GRADE_WRONG);
  });

  it('passing grade is >= 3 (advances) and lapse is < 3 (resets)', () => {
    expect(GRADE_CORRECT).toBeGreaterThanOrEqual(3);
    expect(GRADE_WRONG).toBeLessThan(3);
  });
});
