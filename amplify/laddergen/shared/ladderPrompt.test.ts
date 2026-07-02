import { describe, it, expect } from 'vitest';
import { buildLadderRequest } from './ladderPrompt';

describe('buildLadderRequest', () => {
  it('forces the make_ladder tool', () => {
    const body = JSON.parse(buildLadderRequest({ length: 3, difficulty: 'EASY' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'make_ladder' });
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['start', 'target', 'path', 'dictionary']),
    );
  });
  it('encodes length + difficulty into the system prompt', () => {
    const body = JSON.parse(buildLadderRequest({ length: 4, difficulty: 'HARD' }));
    expect(body.system).toContain('4 letters');
    expect(body.system).toMatch(/5–7 steps/);
  });
});
