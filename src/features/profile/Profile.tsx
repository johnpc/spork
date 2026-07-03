import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useIsEditor } from '../admin/useIsEditor';
import { StreakCard } from '../stats/StreakCard';
import { GuestDailyStats } from './GuestDailyStats';
import { ReminderToggle } from '../reminders/ReminderToggle';
import { TabBar } from '../shell/TabBar';
import { EmptyState } from '../shell/EmptyState';
import './profile.css';

/** "You" tab — account status, editor tools, sign in/out, app info. */
export function Profile() {
  const { status, email, signOut } = useAuth();
  const { isEditor } = useIsEditor();

  if (status !== 'authenticated') {
    return (
      <ProfileShell>
        <GuestDailyStats />
        <EmptyState
          icon={personCircleOutline}
          title="You're browsing as a guest"
          message="Sign in to save decks, track your progress, and sync across devices."
        >
          <Link to="/signin" className="empty-state__cta">
            Sign in
          </Link>
        </EmptyState>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <div className="profile__card">
        <div className="profile__avatar" aria-hidden="true">
          {(email ?? '?').charAt(0).toUpperCase()}
        </div>
        <p className="profile__email" data-testid="profile-email">
          {email}
        </p>
        {isEditor && <span className="profile__badge">Editor</span>}
      </div>

      <StreakCard />
      <ReminderToggle />

      {isEditor && (
        <Link to="/admin/decks" className="profile__row" data-testid="profile-manage">
          Manage decks
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <button
        type="button"
        className="profile__signout"
        data-testid="profile-signout"
        onClick={signOut}
      >
        Sign out
      </button>
      <p className="sp-muted profile__version">SPORK v0.0.1</p>
    </ProfileShell>
  );
}

function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>You</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {children}
        <Link to="/download" className="profile__row" data-testid="profile-download">
          Get the iOS app
          <span aria-hidden="true">→</span>
        </Link>
        <TabBar active="You" />
      </IonContent>
    </IonPage>
  );
}
