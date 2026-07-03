import { lazy } from 'react';
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
import { DailyEntry } from './games/shared/daily/DailyEntry';
import { LazyRoute } from './features/shell/LazyRoute';

// Chess pulls in chess.js (a large legal-move engine) only this route needs —
// lazy-load it so no other game carries the weight (LazyRoute adds Suspense).
const ChessAttack = lazy(() =>
  import('./games/chess/play/ChessAttack').then((m) => ({ default: m.ChessAttack })),
);

/** The per-game list + play routes for every game island. Kept out of AppRoutes
 * so adding a game touches only this file (and Home's shelf data).
 *
 * Returns an ARRAY (not a fragment) so callers spread it as `{gameRoutes()}`:
 * IonRouterOutlet only matches among its DIRECT <Route> children, and an array
 * flattens into direct children — a fragment wrapper does NOT, so its routes
 * would be invisible to the outlet's matcher (and shadowed by any catch-all). */
export function gameRoutes() {
  return [
    <Route exact path="/daily/:game" key="daily">
      <DailyEntry />
    </Route>,
    <Route exact path="/quizzes" key="quizzes">
      <QuizList />
    </Route>,
    <Route exact path="/quizzes/:id/play" key="quizzes-play">
      <Play />
    </Route>,
    <Route exact path="/steps" key="steps">
      <LadderList />
    </Route>,
    <Route exact path="/steps/:id" key="steps-play">
      <Steps />
    </Route>,
    <Route exact path="/acrostic" key="acrostic">
      <AcrosticList />
    </Route>,
    <Route exact path="/acrostic/:id" key="acrostic-play">
      <Acrostic />
    </Route>,
    <Route exact path="/quizzle" key="quizzle">
      <QuizzleList />
    </Route>,
    <Route exact path="/quizzle/:id" key="quizzle-play">
      <Quizzle />
    </Route>,
    <Route exact path="/chess" key="chess">
      <ChessList />
    </Route>,
    <Route exact path="/chess/:id" key="chess-play">
      <LazyRoute>
        <ChessAttack />
      </LazyRoute>
    </Route>,
  ];
}
