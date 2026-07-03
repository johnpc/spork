import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useMemo } from 'react';
import { GAMES } from './homeGames';
import { HomeCard } from './HomeCard';
import { useDailyProgress } from './useDailyProgress';
import { useDailyStreak } from './useDailyStreak';
import { useDocumentTitle } from '../shell/useDocumentTitle';
import { buildDaySummaryText } from './daySummary';
import { ShareDayButton } from './ShareDayButton';
import { dayStamp } from '../../games/shared/daily/today';
import './home.css';

/** Spork Home: the platform's game shelf. Each entry (see homeGames) routes into
 * a game island; `accent`/`emoji` give each a card identity. The hero shows how
 * many of today's daily puzzles are done, and each card badges its own result. */
export function Home() {
  const keys = useMemo(() => GAMES.map((g) => g.dailyKey), []);
  const progress = useDailyProgress(keys);
  const streak = useDailyStreak();
  useDocumentTitle('Spork');
  const daySummary = buildDaySummaryText(GAMES, progress.resultFor, dayStamp(new Date()));

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
          <p className="home-hero__progress" data-testid="home-progress">
            {progress.done === progress.total
              ? `All ${progress.total} done today 🎉`
              : `Today: ${progress.done}/${progress.total} done`}
          </p>
          {streak > 0 && (
            <p className="home-hero__streak" data-testid="home-streak">
              🔥 {streak}-day streak
            </p>
          )}
          <ShareDayButton text={daySummary} />
        </header>
        <ul className="home-games" data-testid="home-games">
          {GAMES.map((g) => (
            <li key={g.name}>
              <HomeCard game={g} result={progress.resultFor(g.dailyKey)} />
            </li>
          ))}
        </ul>
      </IonContent>
    </IonPage>
  );
}
