import { describe, it, expect } from 'vitest';
import { orderItems, placedLabel, revealItems } from './orderUpItems';
import type { AnswerRecord } from '../../../lib/dataClient';

const mk = (id: string, display: string, orderIndex: number) =>
  ({ id, display, orderIndex }) as AnswerRecord;

describe('orderItems', () => {
  it('projects answers into id/display/orderIndex items', () => {
    const items = orderItems([mk('a', 'First', 0)]);
    expect(items).toEqual([{ id: 'a', display: 'First', orderIndex: 0 }]);
  });

  it('defaults a missing orderIndex to -1', () => {
    const items = orderItems([{ id: 'x', display: 'X' } as AnswerRecord]);
    expect(items[0].orderIndex).toBe(-1);
  });

  it('keeps every answer (a permutation) and is independent of input order', () => {
    const forward = [mk('a1', 'One', 0), mk('a2', 'Two', 1), mk('a3', 'Three', 2)];
    const reversed = [...forward].reverse();
    const ids = orderItems(forward).map((i) => i.id);
    expect([...ids].sort()).toEqual(['a1', 'a2', 'a3']);
    // Input order must not change output order (sort is on id-hash, not position).
    expect(orderItems(reversed).map((i) => i.id)).toEqual(ids);
  });

  it('hides the answer: at least one id set is reordered away from orderIndex', () => {
    const answers = [mk('gamma', 'G', 0), mk('alpha', 'A', 1), mk('beta', 'B', 2)];
    const ids = orderItems(answers).map((i) => i.id);
    expect(ids).not.toEqual(['gamma', 'alpha', 'beta']);
  });

  it('is deterministic across calls (stable id-hash sort, no randomness)', () => {
    const answers = [mk('gamma', 'G', 2), mk('alpha', 'A', 0), mk('beta', 'B', 1)];
    expect(orderItems(answers).map((i) => i.id)).toEqual(orderItems(answers).map((i) => i.id));
  });
});

describe('placedLabel', () => {
  it('renders placed-of-total progress', () => {
    expect(placedLabel(2, 5)).toBe('2 of 5 placed');
  });
});

describe('revealItems', () => {
  it('orders items by their correct orderIndex and flags found/missed', () => {
    const answers = [mk('c', 'Third', 2), mk('a', 'First', 0), mk('b', 'Second', 1)];
    const items = revealItems(answers, new Set(['a', 'c']));
    expect(items.map((i) => i.display)).toEqual(['First', 'Second', 'Third']);
    expect(items[0].found).toBe(true); // First (a) was found
    expect(items[1].found).toBe(false); // Second (b) missed
    expect(items[2].found).toBe(true); // Third (c) was found
  });

  it('defaults missing orderIndex to -1', () => {
    const items = revealItems([{ id: 'x', display: 'X' } as AnswerRecord], new Set());
    expect(items[0].orderIndex).toBe(-1);
  });
});
