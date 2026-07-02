import { Redirect, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useDailyEntry } from './useDailyEntry';
import { ComeBackTomorrow } from './ComeBackTomorrow';

/** The `/daily/:game` landing route. Resolves today's puzzle for the game and
 * either redirects into its play surface or — if already finished today — shows
 * the ComeBackTomorrow recap. Keeps the daily gate out of every game screen. */
export function DailyEntry() {
  const { game: gameKey } = useParams<{ game: string }>();
  const { game, playedToday, result, isLoading, playPath } = useDailyEntry(gameKey);

  if (!game) return <Redirect to="/home" />;
  if (playedToday && result) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <ComeBackTomorrow
            game={game.name}
            score={result.score}
            total={result.total}
            timeSeconds={result.timeSeconds}
          />
        </IonContent>
      </IonPage>
    );
  }
  if (isLoading || !playPath) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p className="sp-muted" data-testid="daily-loading">
            Loading today’s puzzle…
          </p>
        </IonContent>
      </IonPage>
    );
  }
  return <Redirect to={playPath} />;
}
