import { lazy, type ComponentType } from 'react';
import { Route } from 'react-router-dom';
import { DailyEntry } from './games/shared/daily/DailyEntry';
import { LazyRoute } from './features/shell/LazyRoute';

// Every game's list + play screen is lazy-loaded: a visitor landing on Home (or
// deep-linking one game) downloads only that game's chunk, not all eight engines
// in the main bundle. The shared DailyEntry stays eager — it's the launch surface
// for the daily games and itself lazy-loads whichever game it routes into. Each
// `lazy` names its default from the module (the components are named exports).
const QuizList = lazy(() => import('./games/quizzes/list/QuizList').then((m) => ({ default: m.QuizList }))); // prettier-ignore
const Play = lazy(() => import('./games/quizzes/play/Play').then((m) => ({ default: m.Play }))); // prettier-ignore
const LadderList = lazy(() => import('./games/steps/list/LadderList').then((m) => ({ default: m.LadderList }))); // prettier-ignore
const Steps = lazy(() => import('./games/steps/play/Steps').then((m) => ({ default: m.Steps })));
const AcrosticList = lazy(() => import('./games/acrostic/list/AcrosticList').then((m) => ({ default: m.AcrosticList }))); // prettier-ignore
const Acrostic = lazy(() => import('./games/acrostic/play/Acrostic').then((m) => ({ default: m.Acrostic }))); // prettier-ignore
const QuizzleList = lazy(() => import('./games/quizzle/list/QuizzleList').then((m) => ({ default: m.QuizzleList }))); // prettier-ignore
const Quizzle = lazy(() => import('./games/quizzle/play/Quizzle').then((m) => ({ default: m.Quizzle }))); // prettier-ignore
const ChessList = lazy(() => import('./games/chess/list/ChessList').then((m) => ({ default: m.ChessList }))); // prettier-ignore
const ChessAttack = lazy(() => import('./games/chess/play/ChessAttack').then((m) => ({ default: m.ChessAttack }))); // prettier-ignore
const WordleList = lazy(() => import('./games/wordle/list/WordleList').then((m) => ({ default: m.WordleList }))); // prettier-ignore
const Wordle = lazy(() => import('./games/wordle/play/Wordle').then((m) => ({ default: m.Wordle }))); // prettier-ignore
const ConnectionsList = lazy(() => import('./games/connections/list/ConnectionsList').then((m) => ({ default: m.ConnectionsList }))); // prettier-ignore
const Connections = lazy(() => import('./games/connections/play/Connections').then((m) => ({ default: m.Connections }))); // prettier-ignore
const BeeList = lazy(() => import('./games/spellingbee/list/BeeList').then((m) => ({ default: m.BeeList }))); // prettier-ignore
const SpellingBee = lazy(() => import('./games/spellingbee/play/SpellingBee').then((m) => ({ default: m.SpellingBee }))); // prettier-ignore

/** One lazy game route: a direct <Route> whose element wraps the lazy component
 * in the shared Suspense boundary (LazyRoute must live INSIDE the route element,
 * since IonRouterOutlet only matches direct <Route> children). */
function gameRoute(path: string, key: string, Component: ComponentType) {
  return (
    <Route exact path={path} key={key}>
      <LazyRoute>
        <Component />
      </LazyRoute>
    </Route>
  );
}

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
    <Route exact path="/daily/:game/:date" key="daily-date">
      <DailyEntry />
    </Route>,
    gameRoute('/quizzes', 'quizzes', QuizList),
    gameRoute('/quizzes/:id/play', 'quizzes-play', Play),
    gameRoute('/steps', 'steps', LadderList),
    gameRoute('/steps/:id', 'steps-play', Steps),
    gameRoute('/acrostic', 'acrostic', AcrosticList),
    gameRoute('/acrostic/:id', 'acrostic-play', Acrostic),
    gameRoute('/quizzle', 'quizzle', QuizzleList),
    gameRoute('/quizzle/:id', 'quizzle-play', Quizzle),
    gameRoute('/chess', 'chess', ChessList),
    gameRoute('/chess/:id', 'chess-play', ChessAttack),
    gameRoute('/wordle', 'wordle', WordleList),
    gameRoute('/wordle/:id', 'wordle-play', Wordle),
    gameRoute('/connections', 'connections', ConnectionsList),
    gameRoute('/connections/:id', 'connections-play', Connections),
    gameRoute('/spellingbee', 'spellingbee', BeeList),
    gameRoute('/spellingbee/:id', 'spellingbee-play', SpellingBee),
  ];
}
