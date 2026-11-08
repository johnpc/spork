/**
 * Local outbox for finished study sessions whose streak save the server hasn't
 * confirmed yet. Finishing a session writes here FIRST, then saves; the entry is
 * removed only after the server confirms. A reload or app close that cuts the
 * save off therefore leaves the session here, and the next launch replays it
 * (see flushPending). Keyed by a per-session id so a replay can be deduplicated.
 */
export interface PendingSession {
  sessionId: string;
  owner: string; // the signed-in user's email — replay only into the same account
  day: string; // YYYY-MM-DD local day the session finished
  reviewed: number;
}

const KEY = 'spork.pendingStudySessions';

const isSession = (v: unknown): v is PendingSession =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as PendingSession).sessionId === 'string' &&
  typeof (v as PendingSession).owner === 'string' &&
  typeof (v as PendingSession).day === 'string' &&
  typeof (v as PendingSession).reviewed === 'number';

/** Every stored session (all users), oldest first; corrupt storage reads as empty. */
function readAll(): PendingSession[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isSession) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: PendingSession[]): void {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

/** The user's unconfirmed sessions, oldest first. */
export function loadPending(owner: string): PendingSession[] {
  return readAll().filter((s) => s.owner === owner);
}

/** Queue a finished session (a no-op if it is already queued). */
export function addPending(session: PendingSession): void {
  const all = readAll();
  if (!all.some((s) => s.sessionId === session.sessionId)) writeAll([...all, session]);
}

/** Drop a session once the server has it. */
export function removePending(sessionId: string): void {
  writeAll(readAll().filter((s) => s.sessionId !== sessionId));
}
