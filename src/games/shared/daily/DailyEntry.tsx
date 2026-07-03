import { Link, Redirect, useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useDailyEntry } from './useDailyEntry';
import { useNextGame } from './useNextGame';
import { ComeBackTomorrow } from './ComeBackTomorrow';

/** The `/daily/:game` landing route. Resolves today's puzzle for the game and
 * either redirects into its play surface, shows the ComeBackTomorrow recap (if
 * already finished today), or a graceful "no puzzle yet" state (if the game has
 * none published) — never an infinite spinner. */
export function DailyEntry() {
  const { game: gameKey } = useParams<{ game: string }>();
  const { game, date, playedToday, result, playPath, empty } = useDailyEntry(gameKey);
  const next = useNextGame(gameKey);

  if (!game) return <Redirect to="/home" />;
  if (playPath) return <Redirect to={playPath} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{game.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {playedToday && result ? (
          <ComeBackTomorrow
            game={game.name}
            score={result.score}
            total={result.total}
            timeSeconds={result.timeSeconds}
            date={date}
            nextTo={next ? `/daily/${next.slug}` : undefined}
            nextName={next?.name}
          />
        ) : empty ? (
          <div className="daily-empty" data-testid="daily-empty">
            <p className="sp-heading">No {game.name} puzzle today yet</p>
            <p className="sp-muted">A fresh one is generated every day — check back soon.</p>
            <Link to="/home" className="empty-state__cta" data-testid="daily-empty-home">
              Back to games
            </Link>
          </div>
        ) : (
          <p className="sp-muted" data-testid="daily-loading">
            Loading today’s puzzle…
          </p>
        )}
      </IonContent>
    </IonPage>
  );
}
