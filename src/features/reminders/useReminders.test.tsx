import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  requestPermission: vi.fn(),
  scheduleDailyReminder: vi.fn(),
  cancelDailyReminder: vi.fn(),
}));
vi.mock('./notify', () => e);

import { useReminders } from './useReminders';

describe('useReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    e.requestPermission.mockResolvedValue(true);
    e.scheduleDailyReminder.mockResolvedValue(undefined);
    e.cancelDailyReminder.mockResolvedValue(undefined);
  });

  it('enables: requests permission, schedules, and persists', async () => {
    const { result } = renderHook(() => useReminders(4));
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(e.scheduleDailyReminder).toHaveBeenCalledWith(4);
    expect(localStorage.getItem('fs-reminders-enabled')).toBe('1');
  });

  it('flags denied and stays off when permission is refused', async () => {
    e.requestPermission.mockResolvedValue(false);
    const { result } = renderHook(() => useReminders(0));
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.denied).toBe(true));
    expect(result.current.enabled).toBe(false);
    expect(e.scheduleDailyReminder).not.toHaveBeenCalled();
  });

  it('disables: cancels and clears persistence', async () => {
    localStorage.setItem('fs-reminders-enabled', '1');
    const { result } = renderHook(() => useReminders(0));
    expect(result.current.enabled).toBe(true);
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.enabled).toBe(false));
    expect(e.cancelDailyReminder).toHaveBeenCalled();
    expect(localStorage.getItem('fs-reminders-enabled')).toBeNull();
  });
});
