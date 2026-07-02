import { describe, it, expect } from 'vitest';
import { dailyKeyForMode } from './dailyKey';

describe('dailyKeyForMode', () => {
  it('namespaces each quiz type as its own daily puzzle', () => {
    expect(dailyKeyForMode('MAP')).toBe('quizzes:MAP');
    expect(dailyKeyForMode('MULTIPLE_CHOICE')).toBe('quizzes:MULTIPLE_CHOICE');
  });

  it('falls back to the bare quizzes key when the mode is unknown', () => {
    expect(dailyKeyForMode(undefined)).toBe('quizzes');
    expect(dailyKeyForMode(null)).toBe('quizzes');
  });
});
