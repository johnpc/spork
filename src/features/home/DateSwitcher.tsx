import { chevronBack, chevronForward } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { prevDay, nextDay, dayStamp } from '../../games/shared/daily/today';

/** Compact ‹ date › stepper for the Home shelf. Steps back through past days
 * (always allowed) and forward toward today (the forward arrow disables ON
 * today — no future browsing). Pure presentation over an injected date + clock. */
export function DateSwitcher({
  date,
  onChange,
  now = new Date(),
}: {
  date: string;
  onChange: (date: string) => void;
  now?: Date;
}) {
  const today = dayStamp(now);
  const atToday = date >= today;
  return (
    <div className="date-switcher" data-testid="date-switcher">
      <button
        type="button"
        className="date-switcher__nav"
        aria-label="Previous day"
        data-testid="date-prev"
        onClick={() => onChange(prevDay(date))}
      >
        <IonIcon icon={chevronBack} aria-hidden="true" />
      </button>
      <span className="date-switcher__label" data-testid="date-label">
        {atToday ? 'Today' : date}
      </span>
      <button
        type="button"
        className="date-switcher__nav"
        aria-label="Next day"
        data-testid="date-next"
        disabled={atToday}
        onClick={() => onChange(nextDay(date))}
      >
        <IonIcon icon={chevronForward} aria-hidden="true" />
      </button>
    </div>
  );
}
