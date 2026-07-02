import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { gameControllerOutline, compassOutline, personOutline } from 'ionicons/icons';
import './tabBar.css';

/** Bottom tab bar. Guest-first: Games (the Spork shelf) is home; Discover browses
 * flashcard decks; You is the profile/streak. No "My Decks" — games are played
 * directly, not saved to a library. */
const TABS: { label: string; icon: string; to?: string }[] = [
  { label: 'Games', icon: gameControllerOutline, to: '/home' },
  { label: 'Discover', icon: compassOutline, to: '/discover' },
  { label: 'You', icon: personOutline, to: '/you' },
];

export function TabBar({ active = 'Games' }: { active?: string }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map(({ label, icon, to }) => {
        const className = label === active ? 'tab-bar__tab tab-bar__tab--active' : 'tab-bar__tab';
        const current = label === active ? 'page' : undefined;
        const inner = (
          <>
            <IonIcon className="tab-bar__icon" icon={icon} aria-hidden="true" />
            <span className="tab-bar__label">{label}</span>
          </>
        );
        return to ? (
          <Link key={label} to={to} className={className} aria-current={current} aria-label={label}>
            {inner}
          </Link>
        ) : (
          <button key={label} type="button" className={className} aria-label={label}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
