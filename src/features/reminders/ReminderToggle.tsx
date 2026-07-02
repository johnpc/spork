import { useDueSummary } from '../mydecks/useDueSummary';
import { useReminders } from './useReminders';
import './reminders.css';

/** "Daily reminder" opt-in row for the You tab. Schedules a local notification
 * that nudges the user to review (native only; the toggle still persists on
 * web, where the schedule is a no-op). */
export function ReminderToggle() {
  const { summary } = useDueSummary();
  const { enabled, denied, busy, toggle } = useReminders(summary?.total ?? 0);
  return (
    <div className="reminder" data-testid="reminder-toggle">
      <div className="reminder__text">
        <span className="reminder__title">Daily review reminder</span>
        <span className="sp-muted reminder__sub">
          {denied
            ? 'Notifications are blocked — enable them in Settings.'
            : 'A nudge each evening to keep your streak.'}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`reminder__switch ${enabled ? 'reminder__switch--on' : ''}`}
        data-testid="reminder-switch"
        disabled={busy}
        onClick={toggle}
      >
        <span className="reminder__knob" />
      </button>
    </div>
  );
}
