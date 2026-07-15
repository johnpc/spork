import { describe, it, expect, vi } from 'vitest';
import { showToast, onToast } from './toastBus';

describe('toastBus', () => {
  it('delivers a message to a subscriber', () => {
    const seen: string[] = [];
    const off = onToast((t) => seen.push(t.message));
    showToast('hi');
    expect(seen).toEqual(['hi']);
    off();
  });

  it('carries an optional action', () => {
    const run = vi.fn();
    let payload: { message: string; action?: { label: string; run: () => void } } | null = null;
    const off = onToast((t) => (payload = t));
    showToast('Deleted', { label: 'Retry', run });
    expect(payload!.action?.label).toBe('Retry');
    payload!.action?.run();
    expect(run).toHaveBeenCalledOnce();
    off();
  });

  it('stops delivering after unsubscribe', () => {
    const seen: string[] = [];
    const off = onToast((t) => seen.push(t.message));
    off();
    showToast('after');
    expect(seen).toEqual([]);
  });
});
