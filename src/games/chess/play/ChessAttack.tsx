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
import { useChessAttack } from './useChessAttack';
import { ChessBoard } from './ChessBoard';
import { ChessSolution } from './ChessSolution';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './chess.css';

/** ChessAttack play screen: solve a mate/capture puzzle on a small board by
 * tapping your piece then its destination, following the known solution. Uses
 * its OWN board engine (useChessAttack) — no shared quiz machinery. */
export function ChessAttack() {
  const { id } = useParams<{ id: string }>();
  const c = useChessAttack(id);
  const elapsed = useElapsed(c.solved);
  useRecordDailyOnDone('chess', c.solved, {
    score: c.total,
    total: c.total,
    timeSeconds: elapsed,
  });
  // One-per-day: a fresh entry after today's is done → recap (not mid/just-solved).
  const recap = useDailyGuard('chess');
  if (c.puzzle && recap && !c.solved && c.moves === 0) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/chess" />
          </IonButtons>
          <IonTitle>{c.puzzle?.name ?? 'Chess Attack'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={c.isLoading} isError={c.isError} onRetry={c.refetch}>
          {!c.puzzle ? (
            <p className="sp-muted" data-testid="chess-unavailable">
              This puzzle can’t be played yet.
            </p>
          ) : (
            <div className="chess" data-testid="chess">
              <p className="chess__goal" data-testid="chess-goal">
                {c.solverSide === 'w' ? 'White' : 'Black'} to move · mate in {c.total}
              </p>
              <p className="sp-muted chess__meta">
                {c.moves} / {c.total} moves
              </p>
              <ChessBoard
                pieces={c.pieces}
                selected={c.selected}
                targets={c.targets}
                onTap={c.tap}
              />
              {c.solved ? (
                <p className="chess__solved" data-testid="chess-solved" role="status">
                  Checkmate! 🏆 Solved in {c.total}.
                </p>
              ) : c.wrong ? (
                <p className="chess__error" data-testid="chess-error" role="alert">
                  Not the mate — try again.
                </p>
              ) : (
                <p className="sp-muted chess__hint" data-testid="chess-hint">
                  Tap your piece, then its destination.
                </p>
              )}
              <ChessSolution line={c.line} gaveUp={c.gaveUp} />
              {!c.solved && !c.gaveUp && (
                <div className="chess__actions">
                  <button data-testid="chess-reset" onClick={c.reset} disabled={c.moves === 0}>
                    Reset
                  </button>
                  <button data-testid="chess-give-up" onClick={c.giveUp}>
                    Give up
                  </button>
                </div>
              )}
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
