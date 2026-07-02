import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useChessAttack } from './useChessAttack';
import { ChessBoard } from './ChessBoard';
import './chess.css';

/** ChessAttack play screen: solve a mate/capture puzzle on a small board by
 * tapping your piece then its destination, following the known solution. Uses
 * its OWN board engine (useChessAttack) — no shared quiz machinery. */
export function ChessAttack() {
  const { id } = useParams<{ id: string }>();
  const c = useChessAttack(id);

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
        {c.isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : !c.puzzle ? (
          <p className="sp-muted" data-testid="chess-unavailable">
            This puzzle can’t be played yet.
          </p>
        ) : (
          <div className="chess" data-testid="chess">
            <p className="chess__goal" data-testid="chess-goal">
              {c.goal}
            </p>
            <p className="sp-muted chess__meta">
              {c.moves} / {c.total} moves
            </p>
            <ChessBoard size={c.size} pieces={c.pieces} selected={c.selected} onTap={c.tap} />
            {c.solved ? (
              <p className="chess__solved" data-testid="chess-solved">
                Solved in {c.total} moves! 🏆
              </p>
            ) : c.wrong ? (
              <p className="chess__error" data-testid="chess-error">
                Try again.
              </p>
            ) : (
              <p className="sp-muted chess__hint" data-testid="chess-hint">
                Tap your piece, then its destination.
              </p>
            )}
            <div className="chess__actions">
              <button data-testid="chess-reset" onClick={c.reset} disabled={c.moves === 0}>
                Reset
              </button>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
