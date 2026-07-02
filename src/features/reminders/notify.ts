/**
 * Isolated edge over @capacitor/local-notifications. Native-only: on web (dev
 * server / PWA without the plugin) every call no-ops, so callers never need to
 * branch on platform. The scheduling decision lives in reminderPlan (pure);
 * this just talks to the plugin. Mocked in tests.
 */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { nextReminderAt, reminderBody, REMINDER_ID } from './reminderPlan';

const native = (): boolean => Capacitor.isNativePlatform();

/** Request notification permission; returns true if granted. No-op on web. */
export async function requestPermission(): Promise<boolean> {
  if (!native()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

/** (Re)schedule the daily reminder for the next fire time. No-op on web. */
export async function scheduleDailyReminder(
  dueCount: number,
  now: Date = new Date(),
): Promise<void> {
  if (!native()) return;
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'SPORK',
        body: reminderBody(dueCount),
        schedule: { at: nextReminderAt(now), every: 'day', allowWhileIdle: true },
      },
    ],
  });
}

/** Cancel the daily reminder. No-op on web. */
export async function cancelDailyReminder(): Promise<void> {
  if (!native()) return;
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}
