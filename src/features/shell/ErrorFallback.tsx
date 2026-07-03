import { IonContent, IonPage } from '@ionic/react';
import './errorBoundary.css';

/** The screen shown when a render crash is caught by ErrorBoundary. Offers a
 * reload (the SPA state is gone, so a full reload is the honest recovery) and a
 * link home. Styled via --sp-* tokens so it reads as part of Spork. */
export function ErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="error-fallback" data-testid="error-fallback">
          <span className="error-fallback__emoji" aria-hidden="true">
            🥄
          </span>
          <h2 className="sp-heading error-fallback__title">Something went sideways</h2>
          <p className="sp-muted">
            This screen hit a snag. Reloading usually clears it — your daily progress is saved.
          </p>
          <button
            type="button"
            className="error-fallback__reload"
            data-testid="error-reload"
            onClick={onReload}
          >
            Reload
          </button>
          <a className="error-fallback__home" href="/home" data-testid="error-home">
            Back to games
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
}
