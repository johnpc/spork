import { Route } from 'react-router-dom';
import { QuizList } from './games/quizzes/list/QuizList';
import { Play } from './games/quizzes/play/Play';
import { LadderList } from './games/steps/list/LadderList';
import { Steps } from './games/steps/play/Steps';
import { AcrosticList } from './games/acrostic/list/AcrosticList';
import { Acrostic } from './games/acrostic/play/Acrostic';
import { QuizzleList } from './games/quizzle/list/QuizzleList';
import { Quizzle } from './games/quizzle/play/Quizzle';
import { ChessList } from './games/chess/list/ChessList';
import { ChessAttack } from './games/chess/play/ChessAttack';
import { DailyEntry } from './games/shared/daily/DailyEntry';

/** The per-game list + play routes for every game island. Kept out of AppRoutes
 * so adding a game touches only this file (and Home's shelf data). Returned as a
 * fragment of <Route>s so it composes inside the app's IonRouterOutlet. */
export function GameRoutes() {
  return (
    <>
      <Route exact path="/daily/:game">
        <DailyEntry />
      </Route>
      <Route exact path="/quizzes">
        <QuizList />
      </Route>
      <Route exact path="/quizzes/:id/play">
        <Play />
      </Route>
      <Route exact path="/steps">
        <LadderList />
      </Route>
      <Route exact path="/steps/:id">
        <Steps />
      </Route>
      <Route exact path="/acrostic">
        <AcrosticList />
      </Route>
      <Route exact path="/acrostic/:id">
        <Acrostic />
      </Route>
      <Route exact path="/quizzle">
        <QuizzleList />
      </Route>
      <Route exact path="/quizzle/:id">
        <Quizzle />
      </Route>
      <Route exact path="/chess">
        <ChessList />
      </Route>
      <Route exact path="/chess/:id">
        <ChessAttack />
      </Route>
    </>
  );
}
