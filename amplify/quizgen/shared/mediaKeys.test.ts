import { describe, it, expect } from 'vitest';
import { answerImageKey } from './mediaKeys';

describe('answerImageKey', () => {
  it('keys under the quiz media prefix by answer id', () => {
    expect(answerImageKey('q1', 'q1#3')).toBe('media/quizzes/q1/q1#3.webp');
  });
});
