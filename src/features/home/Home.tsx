import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Link } from 'react-router-dom';
import './home.css';

/** Spork Home: the platform's game shelf. Each entry routes into a game island;
 * `accent`/`emoji` give each game its own identity on the card. */
interface GameCard {
  name: string;
  tagline: string;
  to: string;
  testId: string;
  emoji: string;
  accent: string; // gradient for the card face
}

const GAMES: GameCard[] = [
  {
    name: 'Quizzes',
    tagline: 'Name them all before the clock runs out.',
    to: '/quizzes',
    testId: 'game-quizzes',
    emoji: '🗺️',
    accent: 'linear-gradient(135deg, #5b8def, #4a7fe0)',
  },
  {
    name: 'Steps',
    tagline: 'Turn one word into another, one letter at a time.',
    to: '/steps',
    testId: 'game-steps',
    emoji: '🪜',
    accent: 'linear-gradient(135deg, #f6a23c, #ea7d2b)',
  },
  {
    name: 'Flashcards',
    tagline: 'Learn anything with spaced repetition.',
    to: '/discover',
    testId: 'game-flashcards',
    emoji: '🃏',
    accent: 'linear-gradient(135deg, #34c08a, #22a06b)',
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
