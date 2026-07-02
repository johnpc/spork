import { describe, it, expect } from 'vitest';
import { buildAnswersRequest, type GenMode } from './answersPrompt';

const parse = (mode: GenMode) =>
  JSON.parse(buildAnswersRequest({ mode, topic: 'X', answerCount: 5 }));

describe('buildAnswersRequest', () => {
  it('forces the generate_answers tool', () => {
    const body = parse('CLASSIC');
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'generate_answers' });
    expect(body.tools[0].name).toBe('generate_answers');
    expect(body.anthropic_version).toBe('bedrock-2023-05-31');
  });

  it('asks for exactly the requested count in the system prompt', () => {
    expect(parse('CLASSIC').system).toContain('exactly 5');
  });

  it('MULTIPLE_CHOICE item schema requires question + options (accepted optional)', () => {
    const props = parse('MULTIPLE_CHOICE').tools[0].input_schema.properties.answers.items;
    expect(Object.keys(props.properties)).toEqual(
      expect.arrayContaining(['question', 'display', 'options']),
    );
    expect(props.required).toContain('question');
    expect(props.required).toContain('options');
  });

  it('SORTABLE requires a bucket; ORDER_UP hints sequence order', () => {
    const sortable = parse('SORTABLE').tools[0].input_schema.properties.answers.items;
    expect(sortable.required).toContain('bucket');
    expect(parse('ORDER_UP').system).toMatch(/sequence order/i);
  });

  it('PICTURE_BOX asks for an imagePrompt', () => {
    const props = parse('PICTURE_BOX').tools[0].input_schema.properties.answers.items.properties;
    expect(props.imagePrompt).toBeDefined();
  });

  it('never requires `accepted` (it is an optional alias list)', () => {
    for (const m of ['CLASSIC', 'SLIDESHOW', 'ORDER_UP'] as GenMode[]) {
      const items = parse(m).tools[0].input_schema.properties.answers.items;
      expect(items.required).not.toContain('accepted');
    }
  });
});
