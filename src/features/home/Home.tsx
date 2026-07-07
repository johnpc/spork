import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useMemo, useState } from 'react';
import { GAMES } from './homeGames';
import { HomeCard } from './HomeCard';
import { DateSwitcher } from './DateSwitcher';
import { useDailyProgress } from './useDailyProgress';
import { useDailyStreak } from './useDailyStreak';
import { useDocumentTitle } from '../shell/useDocumentTitle';
import { buildDaySummaryText } from './daySummary';
import { ShareDayButton } from './ShareDayButton';
import { dayStamp } from '../../games/shared/daily/today';
import './home.css';

/** Spork Home: the platform's game shelf. Each entry (see homeGames) routes into
 * a game island; `accent`/`emoji` give each a card identity. A date switcher lets
 * you browse past days; the hero + each card badge reflect the VIEWED day. */
export function Home() {
  const keys = useMemo(() => GAMES.map((g) => g.dailyKey), []);
  const today = dayStamp(new Date());
  const [date, setDate] = useState(today);
  const viewingToday = date === today;
  const progress = useDailyProgress(keys, date);
  const streak = useDailyStreak();
  useDocumentTitle('Spork');
  const daySummary = buildDaySummaryText(GAMES, progress.resultFor, date);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spork</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <header className="home-hero">
          <h1 className="home-hero__title">Spork</h1>
          <p className="home-hero__sub">A stack of little brain games</p>
          <DateSwitcher date={date} onChange={setDate} />
          <p className="home-hero__progress" data-testid="home-progress">
            {progress.done === progress.total
              ? `All ${progress.total} done ${viewingToday ? 'today' : 'that day'} 🎉`
              : `${viewingToday ? 'Today' : date}: ${progress.done}/${progress.total} done`}
          </p>
          {viewingToday && streak > 0 && (
            <p className="home-hero__streak" data-testid="home-streak">
              🔥 {streak}-day streak
            </p>
          )}
          <ShareDayButton text={daySummary} />
        </header>
        <ul className="home-games" data-testid="home-games">
          {GAMES.map((g) => (
            <li key={g.name}>
              <HomeCard
                game={g}
                result={progress.resultFor(g.dailyKey)}
                date={viewingToday ? undefined : date}
              />
            </li>
          ))}
        </ul>
      </IonContent>
    </IonPage>
  );
}
