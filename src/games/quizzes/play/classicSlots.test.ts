import { describe, it, expect } from 'vitest';
import { classicSlots } from './classicSlots';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, display: string, groupKey?: string) =>
  ({ id, display, groupKey }) as AnswerRecord;

describe('classicSlots', () => {
  it('projects the found set onto each slot by answer id', () => {
    const answers = [mk('a', 'Adams'), mk('b', 'Bush')];
    const slots = classicSlots(answers, new Set(['b']));
    expect(slots.find((s) => s.id === 'a')?.found).toBe(false);
    expect(slots.find((s) => s.id === 'b')?.found).toBe(true);
  });

  it('orders slots stably by groupKey then display', () => {
    const answers = [mk('c', 'Zeta'), mk('a', 'Alpha'), mk('b', 'Beta')];
    expect(classicSlots(answers, new Set()).map((s) => s.display)).toEqual([
      'Alpha',
      'Beta',
      'Zeta',
    ]);
  });

  it('groups related items (groupKey) ahead of the label sort', () => {
    const answers = [mk('a', 'Zulu', 'g1'), mk('b', 'Alpha', 'g2')];
    expect(classicSlots(answers, new Set()).map((s) => s.display)).toEqual(['Zulu', 'Alpha']);
  });

  it('defends against a null display/groupKey in the sort without throwing', () => {
    const answers = [mk('a', 'Alpha'), { id: 'x' } as AnswerRecord];
    const slots = classicSlots(answers, new Set(['x']));
    expect(slots.find((s) => s.id === 'x')).toMatchObject({ display: '', found: true });
    expect(slots.map((s) => s.id)).toEqual(['x', 'a']);
  });
});
