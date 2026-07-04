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
import { useLadder } from './useLadder';
import { StepsContent } from './StepsContent';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './steps.css';

/** Steps (word ladder) play screen: transform start → target one letter at a
 * time. Uses its OWN engine (useLadder) — no shared quiz machinery. */
export function Steps() {
  const { id } = useParams<{ id: string }>();
  const l = useLadder(id);
  const elapsed = useElapsed(l.solved);
  useRecordDailyOnDone('steps', l.solved, {
    score: l.moves,
    total: l.par ?? l.moves,
    timeSeconds: elapsed,
  });
  // One-per-day: a fresh entry after today's is done → recap.
  const recap = useDailyGuard('steps');
  if (l.ladder && recap && !l.solved && l.moves === 0) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/steps" />
          </IonButtons>
          <IonTitle>Steps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={l.isLoading} isError={l.isError} onRetry={l.refetch}>
          <StepsContent l={l} />
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
