import { describe, it, expect } from 'vitest';
import { buildAcrosticRequest } from './acrosticPrompt';

describe('buildAcrosticRequest', () => {
  it('forces the make_acrostic tool', () => {
    const body = JSON.parse(buildAcrosticRequest({ topic: 'perseverance' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'make_acrostic' });
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['title', 'quote', 'author', 'clues']),
    );
  });
  it('encodes the topic into the system prompt and user message', () => {
    const body = JSON.parse(buildAcrosticRequest({ topic: 'curiosity' }));
    expect(body.system).toContain('curiosity');
    expect(body.system).toContain('at least 4 clues');
    expect(body.messages[0].content).toContain('curiosity');
  });
});
