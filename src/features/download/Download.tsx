import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './download.css';

/** Public download page: get the Spork iOS app via TestFlight. Linked from the
 * profile + reachable at /download so it can be shared directly. */
export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/b25fhqgK';

export function Download() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Download</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="download" data-testid="download">
          <span className="download__emoji" aria-hidden="true">
            🍴
          </span>
          <h1 className="sp-heading download__title">Get Spork on your iPhone</h1>
          <p className="sp-muted download__sub">
            Spork is in public beta on TestFlight. Install Apple’s TestFlight app, then tap the
            button to join and download the latest build.
          </p>
          <a
            className="download__cta"
            data-testid="download-testflight"
            href={TESTFLIGHT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the TestFlight beta
          </a>
          <p className="sp-muted download__hint">
            No iPhone? You can play everything right here in your browser — it’s a full web app.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
