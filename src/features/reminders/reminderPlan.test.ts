import { describe, it, expect } from 'vitest';
import { nextReminderAt, reminderBody, REMINDER_HOUR } from './reminderPlan';

describe('nextReminderAt', () => {
  it('schedules today when the hour is still upcoming', () => {
    const now = new Date(2026, 5, 10, 9, 0, 0); // 9am
    const at = nextReminderAt(now, 19);
    expect(at.getDate()).toBe(10);
    expect(at.getHours()).toBe(19);
  });

  it('rolls to tomorrow when the hour has passed', () => {
    const now = new Date(2026, 5, 10, 21, 0, 0); // 9pm, past 7pm
    const at = nextReminderAt(now, 19);
    expect(at.getDate()).toBe(11);
    expect(at.getHours()).toBe(19);
  });

  it('rolls to tomorrow when exactly at the hour (strictly after)', () => {
    const now = new Date(2026, 5, 10, 19, 0, 0);
    expect(nextReminderAt(now, 19).getDate()).toBe(11);
  });

  it('defaults to the configured reminder hour', () => {
    const at = nextReminderAt(new Date(2026, 5, 10, 0, 0, 0));
    expect(at.getHours()).toBe(REMINDER_HOUR);
  });
});

describe('reminderBody', () => {
  it('names the due count when known', () => {
    expect(reminderBody(5)).toContain('5 cards due');
    expect(reminderBody(1)).toContain('1 card due');
  });

  it('falls back to a generic nudge when nothing/unknown', () => {
    expect(reminderBody(0)).toMatch(/today’s review/);
  });
});
