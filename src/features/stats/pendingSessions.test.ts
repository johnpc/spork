import { describe, it, expect, beforeEach } from 'vitest';
import { addPending, loadPending, removePending, type PendingSession } from './pendingSessions';

const a: PendingSession = { sessionId: 'a', owner: 'me@x.com', day: '2026-06-10', reviewed: 3 };
const b: PendingSession = { sessionId: 'b', owner: 'me@x.com', day: '2026-06-11', reviewed: 2 };

describe('pending study sessions (local outbox)', () => {
  beforeEach(() => localStorage.clear());

  it('keeps sessions in the order they were added', () => {
    addPending(a);
    addPending(b);
    expect(loadPending('me@x.com').map((s) => s.sessionId)).toEqual(['a', 'b']);
  });

  it('adding the same session twice stores it once', () => {
    addPending(a);
    addPending(a);
    expect(loadPending('me@x.com')).toHaveLength(1);
  });

  it("only returns the signed-in user's sessions", () => {
    addPending(a);
    addPending({ ...b, owner: 'other@x.com' });
    expect(loadPending('me@x.com').map((s) => s.sessionId)).toEqual(['a']);
    expect(loadPending('other@x.com').map((s) => s.sessionId)).toEqual(['b']);
  });

  it('removes a confirmed session and leaves the rest', () => {
    addPending(a);
    addPending(b);
    removePending('a');
    expect(loadPending('me@x.com').map((s) => s.sessionId)).toEqual(['b']);
  });

  it('treats corrupt or foreign storage as empty instead of throwing', () => {
    localStorage.setItem('spork.pendingStudySessions', '{not json');
    expect(loadPending('me@x.com')).toEqual([]);
    localStorage.setItem('spork.pendingStudySessions', JSON.stringify({ nope: 1 }));
    expect(loadPending('me@x.com')).toEqual([]);
  });
});
