/** Extract the set of calendar days on which the player finished any daily
 * puzzle, from the device store's `spork.daily.<game>.<YYYY-MM-DD>` keys. Pure
 * over an injected key list so it's testable; the app passes localStorage keys.
 * The date is the trailing 10 chars of the key (games may contain dots, e.g.
 * "quizzes:MAP"), so we parse from the end, not by splitting on ".". */
const PREFIX = 'spork.daily.';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function playedDatesFrom(keys: string[]): Set<string> {
  const dates = new Set<string>();
  for (const key of keys) {
    if (!key.startsWith(PREFIX)) continue;
    const date = key.slice(-10);
    if (DATE_RE.test(date)) dates.add(date);
  }
  return dates;
}

/** All keys in a Storage-like object (localStorage exposes key(i)/length). */
export function allKeys(store: Pick<Storage, 'key' | 'length'>): string[] {
  const out: string[] = [];
  for (let i = 0; i < store.length; i += 1) {
    const k = store.key(i);
    if (k) out.push(k);
  }
  return out;
}
