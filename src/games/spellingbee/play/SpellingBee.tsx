import React from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Redirect, useParams } from 'react-router-dom';
import { useSpellingBee } from './useSpellingBee';
import { BeePlayArea } from './BeePlayArea';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './spellingBee.css';

/** Spelling Bee play screen: find words using the 7 letters. */
export function SpellingBee() {
  const { id } = useParams<{ id: string }>();
  const b = useSpellingBee(id);
  const [lastResult, setLastResult] = React.useState<{ ok: boolean; reason: string } | null>(null);
  const [gaveUp, setGaveUp] = React.useState(false);
  const done = b.done || gaveUp;
  // Record + gate against the puzzle's OWN date (undefined → today).
  const day = b.bee?.puzzleDate ?? undefined;
  useRecordDailyOnDone('spellingbee', done, { score: b.score, total: b.answers.length }, day);
  const recap = useDailyGuard('spellingbee', day);
  if (b.bee && recap && !done) return <Redirect to={recap} />;

  const handleSubmit = () => {
    setLastResult(b.submit());
  };

  const handleGiveUp = () => {
    setGaveUp(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/spellingbee" />
          </IonButtons>
          <IonTitle>Spelling Bee</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={b.isLoading} isError={b.isError} onRetry={b.refetch}>
          {!b.bee ? (
            <p className="sp-muted" data-testid="bee-unavailable">
              This puzzle can't be played yet.
            </p>
          ) : (
            <BeePlayArea
              current={b.current}
              found={b.found}
              score={b.score}
              answersTotal={b.answers.length}
              centerLetter={b.centerLetter}
              outerOrder={b.outerOrder}
              pangrams={b.pangrams}
              answers={b.answers}
              lastResult={lastResult}
              onType={b.type}
              onBackspace={b.backspace}
              onShuffle={b.shuffleOuter}
              onSubmit={handleSubmit}
              onGiveUp={handleGiveUp}
            />
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
