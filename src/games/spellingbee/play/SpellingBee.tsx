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
  useRecordDailyOnDone('spellingbee', b.done, { score: b.score, total: b.answers.length });
  const recap = useDailyGuard('spellingbee');
  if (b.bee && recap && !b.done) return <Redirect to={recap} />;

  const handleSubmit = () => {
    setLastResult(b.submit());
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
              lastResult={lastResult}
              onType={b.type}
              onBackspace={b.backspace}
              onShuffle={b.shuffleOuter}
              onSubmit={handleSubmit}
            />
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
