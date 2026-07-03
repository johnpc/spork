import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';
import './errorBoundary.css';

/** 404 screen for any unmatched route — a friendly dead-end back to the games,
 * so a mistyped/stale URL never renders a blank page. */
export function NotFound() {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="error-fallback" data-testid="not-found">
          <span className="error-fallback__emoji" aria-hidden="true">
            🍴
          </span>
          <h2 className="sp-heading error-fallback__title">Nothing here</h2>
          <p className="sp-muted">That page doesn’t exist. Let’s get you back to the games.</p>
          <Link className="error-fallback__reload" to="/home" data-testid="not-found-home">
            Back to games
          </Link>
        </div>
      </IonContent>
    </IonPage>
  );
}
