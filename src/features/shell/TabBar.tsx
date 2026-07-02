import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { compassOutline, libraryOutline, personOutline } from 'ionicons/icons';
import './tabBar.css';

/** Bottom tab bar. Wired tabs navigate; the rest are placeholders for now. */
const TABS: { label: string; icon: string; to?: string }[] = [
  { label: 'Discover', icon: compassOutline, to: '/discover' },
  { label: 'My Decks', icon: libraryOutline, to: '/my-decks' },
  { label: 'You', icon: personOutline, to: '/you' },
];

export function TabBar({ active = 'Discover' }: { active?: string }) {
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
