import { Redirect, useParams } from 'react-router-dom';
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
import { useDocumentTitle } from '../../../features/shell/useDocumentTitle';
import { DailyEntryBody } from './DailyEntryBody';
import { isValidDayStamp } from './today';

/** The `/daily/:game` (today) and `/daily/:game/:date` (browse a past day)
 * landing route. Resolves the day's puzzle and either redirects into play, shows
 * the recap (already finished), generates a never-seen past day, or a graceful
 * empty state — never an infinite spinner. */
export function DailyEntry() {
  const { game: gameKey, date } = useParams<{ game: string; date?: string }>();
  // A malformed /date segment falls back to today rather than 404ing.
  const day = date && isValidDayStamp(date) ? date : undefined;
  const entry = useDailyEntry(gameKey, day);
  const next = useNextGame(gameKey);
  useDocumentTitle(entry.game?.name);

  if (!entry.game) return <Redirect to="/home" />;
  if (entry.playPath) return <Redirect to={entry.playPath} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{entry.game.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DailyEntryBody
          gameName={entry.game.name}
          date={entry.date}
          browsing={entry.browsing}
          playedToday={entry.playedToday}
          result={entry.result}
          generating={entry.generating}
          genError={entry.genError}
          empty={entry.empty}
          next={next}
        />
      </IonContent>
    </IonPage>
  );
}
