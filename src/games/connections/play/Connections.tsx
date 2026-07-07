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
import { useConnections } from './useConnections';
import { ConnectionsGrid } from './ConnectionsGrid';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import { ConnectionsFooter } from './ConnectionsFooter';
import './connections.css';

/** Connections play screen: sort 16 words into 4 hidden groups of 4. */
export function Connections() {
  const { id } = useParams<{ id: string }>();
  const c = useConnections(id);
  const elapsed = useElapsed(c.done);
  // Record + gate against the puzzle's OWN date (undefined → today).
  const day = c.puzzle?.puzzleDate ?? undefined;
  useRecordDailyOnDone(
    'connections',
    c.done,
    { score: c.solvedGroups.length, total: 4, timeSeconds: elapsed },
    day,
  );
  const recap = useDailyGuard('connections', day);
  if (c.puzzle && recap && !c.done && c.mistakes === 0) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/connections" />
          </IonButtons>
          <IonTitle>Connections</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={c.isLoading} isError={c.isError} onRetry={c.refetch}>
          {!c.puzzle ? (
            <p className="sp-muted" data-testid="connections-unavailable">
              This puzzle can't be played yet.
            </p>
          ) : (
            <div className="connections" data-testid="connections">
              <p className="sp-muted connections__intro">
                Find groups of four items that share something in common.
              </p>
              <p className="sp-muted connections__meta">
                Mistakes: {c.mistakes} / {c.maxMistakes}
              </p>
              <ConnectionsGrid
                tiles={c.tiles}
                selected={c.selected}
                solvedGroups={c.solvedGroups}
                onToggle={c.toggle}
                done={c.done}
              />
              <ConnectionsFooter
                won={c.won}
                lost={c.lost}
                done={c.done}
                oneAway={c.lastOneAway}
                canDeselect={c.selected.length > 0}
                canSubmit={c.selected.length === 4}
                onDeselectAll={c.deselectAll}
                onSubmit={c.submit}
                groups={c.groups}
                solvedIndices={c.solvedIndices}
              />
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
