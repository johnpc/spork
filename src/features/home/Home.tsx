import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Link } from 'react-router-dom';
import { GAMES } from './homeGames';
import './home.css';

/** Spork Home: the platform's game shelf. Each entry (see homeGames) routes
 * into a game island; `accent`/`emoji` give each game its own card identity. */
export function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spork</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <header className="home-hero">
          <h1 className="home-hero__title">Spork</h1>
          <p className="home-hero__sub">A stack of little brain games</p>
        </header>
        <ul className="home-games" data-testid="home-games">
          {GAMES.map((g) => (
            <li key={g.name}>
              <Link
                className="home-card"
                to={g.to}
                data-testid={g.testId}
                style={{ background: g.accent }}
              >
                <span className="home-card__emoji" aria-hidden="true">
                  {g.emoji}
                </span>
                <span className="home-card__body">
                  <span className="home-card__name">{g.name}</span>
                  <span className="home-card__tagline">{g.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </IonContent>
    </IonPage>
  );
}
