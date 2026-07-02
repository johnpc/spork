import { describe, it, expect } from 'vitest';
import { buildAcrosticRequest } from './acrosticPrompt';

describe('buildAcrosticRequest', () => {
  it('forces the make_acrostic tool', () => {
    const body = JSON.parse(buildAcrosticRequest({ word: 'ocean' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'make_acrostic' });
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['title', 'quote', 'author', 'clues']),
    );
  });
  it('encodes the secret word + its letters + one-clue-per-letter rule', () => {
    const body = JSON.parse(buildAcrosticRequest({ word: 'ocean' }));
    expect(body.system).toContain('OCEAN');
    expect(body.system).toContain('EXACTLY 5 clues');
    expect(body.system).toContain('O, C, E, A, N');
    expect(body.messages[0].content).toContain('OCEAN');
  });
});
