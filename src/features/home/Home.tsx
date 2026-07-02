import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Link } from 'react-router-dom';
import './home.css';

/** Spork Home: the platform's game shelf. Each entry routes into a game island.
 * Games grow per slice; Quizzes + Flashcards ship first. */
const GAMES: { name: string; tagline: string; to: string; testId: string }[] = [
  {
    name: 'Quizzes',
    tagline: 'Name them all before the clock runs out.',
    to: '/quizzes',
    testId: 'game-quizzes',
  },
  {
    name: 'Steps',
    tagline: 'Turn one word into another, one letter at a time.',
    to: '/steps',
    testId: 'game-steps',
  },
  {
    name: 'Flashcards',
    tagline: 'Learn anything with spaced repetition.',
    to: '/discover',
    testId: 'game-flashcards',
  },
];

export function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spork</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p className="sp-kicker">A stack of little brain games</p>
        <ul className="home-games" data-testid="home-games">
          {GAMES.map((g) => (
            <li key={g.name}>
              <Link className="home-games__card" to={g.to} data-testid={g.testId}>
                <span className="sp-heading home-games__name">{g.name}</span>
                <span className="sp-muted">{g.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </IonContent>
    </IonPage>
  );
}
