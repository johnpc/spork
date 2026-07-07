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
import { useWordle } from './useWordle';
import { WordleBoard } from './WordleBoard';
import { WordleKeyboard } from './WordleKeyboard';
import { WordleResult } from './WordleResult';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './wordle.css';

/** Wordle play screen: guess the word in 6 tries. Guest-playable daily game. */
export function Wordle() {
  const { id } = useParams<{ id: string }>();
  const w = useWordle(id);
  const elapsed = useElapsed(w.gameOver);
  // Record + gate against the PUZZLE's own date, so a past-day session writes its
  // badge (and recaps) under that date, not today. Undefined → today.
  const day = w.puzzle?.puzzleDate ?? undefined;
  useRecordDailyOnDone(
    'wordle',
    w.gameOver,
    { score: w.won ? w.guesses.length : 0, total: w.puzzle?.maxGuesses ?? 6, timeSeconds: elapsed },
    day,
  );
  // One-per-day: a fresh entry after that day's is done → recap.
  const recap = useDailyGuard('wordle', day);
  if (w.puzzle && recap && !w.gameOver && w.guesses.length === 0) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/wordle" />
          </IonButtons>
          <IonTitle>Wordle</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={w.isLoading} isError={w.isError} onRetry={w.refetch}>
          {!w.puzzle ? (
            <p className="sp-muted" data-testid="wordle-unavailable">
              This puzzle can't be played yet.
            </p>
          ) : (
            <div className="wordle" data-testid="wordle">
              <p className="wordle__intro sp-muted">
                Guess the word in {w.puzzle.maxGuesses} tries. Each guess must be a valid{' '}
                {w.puzzle.wordLength}-letter word.
              </p>
              <WordleBoard
                guesses={w.guesses}
                current={w.current}
                answer={w.puzzle.answer}
                wordLength={w.puzzle.wordLength}
                maxGuesses={w.puzzle.maxGuesses}
              />
              {w.invalidWord && (
                <p className="wordle__error" data-testid="wordle-error" role="alert">
                  Not in word list
                </p>
              )}
              <WordleResult
                status={w.status}
                guessCount={w.guesses.length}
                answer={w.puzzle.answer}
              />
              <WordleKeyboard
                guesses={w.guesses}
                answer={w.puzzle.answer}
                onType={w.type}
                onBackspace={w.backspace}
                onEnter={w.submitGuess}
                disabled={w.gameOver}
              />
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
