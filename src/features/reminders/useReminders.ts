import { useCallback, useState } from 'react';
import { requestPermission, scheduleDailyReminder, cancelDailyReminder } from './notify';

const STORAGE_KEY = 'fs-reminders-enabled';

/** Daily-reminder opt-in toggle. Persists the choice in localStorage; enabling
 * requests permission then schedules, disabling cancels. `dueCount` seeds the
 * reminder copy. `denied` flags when the OS refused permission. */
export function useReminders(dueCount: number) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    setBusy(true);
    try {
      if (enabled) {
        await cancelDailyReminder();
        localStorage.removeItem(STORAGE_KEY);
        setEnabled(false);
        return;
      }
      const granted = await requestPermission();
      if (!granted) {
        setDenied(true);
        return;
      }
      await scheduleDailyReminder(dueCount);
      localStorage.setItem(STORAGE_KEY, '1');
      setDenied(false);
      setEnabled(true);
    } finally {
      setBusy(false);
    }
  }, [enabled, dueCount]);

  return { enabled, denied, busy, toggle };
}
