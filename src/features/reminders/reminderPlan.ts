/**
 * Pure scheduling logic for the daily review reminder. Given "now" and the
 * preferred hour-of-day, return the next fire time: today at that hour if it's
 * still upcoming, otherwise tomorrow. Kept pure (no plugin, no clock) so the
 * timing rule is unit-tested without a device.
 */
export const REMINDER_HOUR = 19; // 7pm local — a sensible default study nudge.
export const REMINDER_ID = 1; // single recurring reminder; stable id to replace.

/** The next Date at `hour:00` local that is strictly after `now`. */
export function nextReminderAt(now: Date, hour: number = REMINDER_HOUR): Date {
  const at = new Date(now);
  at.setHours(hour, 0, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

/** Reminder body copy from the number of cards due (generic when unknown). */
export function reminderBody(dueCount: number): string {
  if (dueCount <= 0) return 'Time for today’s review — keep your streak going!';
  return `You have ${dueCount} card${dueCount === 1 ? '' : 's'} due. Keep your streak going!`;
}
