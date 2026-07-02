import { describe, it, expect, vi, beforeEach } from 'vitest';

const cap = vi.hoisted(() => ({ isNative: true }));
const plugin = vi.hoisted(() => ({
  requestPermissions: vi.fn(),
  schedule: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => cap.isNative } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: plugin }));

import { requestPermission, scheduleDailyReminder, cancelDailyReminder } from './notify';

describe('notify (native)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cap.isNative = true;
    plugin.requestPermissions.mockResolvedValue({ display: 'granted' });
    plugin.schedule.mockResolvedValue(undefined);
    plugin.cancel.mockResolvedValue(undefined);
  });

  it('requestPermission returns true when granted', async () => {
    expect(await requestPermission()).toBe(true);
  });

  it('requestPermission returns false when denied', async () => {
    plugin.requestPermissions.mockResolvedValue({ display: 'denied' });
    expect(await requestPermission()).toBe(false);
  });

  it('scheduleDailyReminder cancels the prior then schedules a daily one', async () => {
    await scheduleDailyReminder(3, new Date(2026, 5, 10, 9, 0, 0));
    expect(plugin.cancel).toHaveBeenCalled();
    const arg = plugin.schedule.mock.calls[0][0].notifications[0];
    expect(arg.schedule.every).toBe('day');
    expect(arg.body).toContain('3 cards');
  });

  it('cancelDailyReminder cancels', async () => {
    await cancelDailyReminder();
    expect(plugin.cancel).toHaveBeenCalled();
  });
});

describe('notify (web no-op)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cap.isNative = false;
  });

  it('does nothing and reports no permission on web', async () => {
    expect(await requestPermission()).toBe(false);
    await scheduleDailyReminder(5);
    await cancelDailyReminder();
    expect(plugin.schedule).not.toHaveBeenCalled();
    expect(plugin.cancel).not.toHaveBeenCalled();
  });
});
