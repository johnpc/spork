import { describe, it, expect } from 'vitest';
import { buildQuizzleRequest } from './quizzlePrompt';

describe('buildQuizzleRequest', () => {
  it('forces the make_quizzle tool', () => {
    const body = JSON.parse(buildQuizzleRequest({ topic: 'Science' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'make_quizzle' });
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['topic', 'questions']),
    );
    expect(body.tools[0].input_schema.properties.questions.items.required).toEqual(
      expect.arrayContaining(['question', 'answer', 'accepted']),
    );
  });

  it('encodes the topic into the system prompt and user message', () => {
    const body = JSON.parse(buildQuizzleRequest({ topic: 'World Geography' }));
    expect(body.system).toContain('World Geography');
    expect(body.system).toMatch(/at least 4/);
    expect(body.messages[0].content).toContain('World Geography');
  });
});
