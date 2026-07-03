import { lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { Home } from './features/home/Home';
import { gameRoutes } from './GameRoutes';
import { Discover } from './features/discover/Discover';
import { CategoryDecks } from './features/discover/CategoryDecks';
import { DeckDetail } from './features/deck/DeckDetail';
import { Study } from './features/study/Study';
import { MyDecks } from './features/mydecks/MyDecks';
import { Profile } from './features/profile/Profile';
import { Download } from './features/download/Download';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { EditorGate } from './features/admin/EditorGate';
import { LazyRoute } from './features/shell/LazyRoute';
import { NotFound } from './features/shell/NotFound';

// Editor-only admin screens — no guest ever reaches these, so keep them out of
// the main bundle (lazy chunks). EditorGate (the access check) stays eager.
const QuizAdmin = lazy(() =>
  import('./games/quizzes/admin/QuizAdmin').then((m) => ({ default: m.QuizAdmin })),
);
const ManageDecks = lazy(() =>
  import('./features/admin/ManageDecks').then((m) => ({ default: m.ManageDecks })),
);
const DeckEditor = lazy(() =>
  import('./features/admin/DeckEditor').then((m) => ({ default: m.DeckEditor })),
);

/** App routes. Home is the platform shell (game shelf); per-game list/play
 * routes live in GameRoutes so adding a game doesn't touch this file. */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/home">
        <Home />
      </Route>
      {gameRoutes()}
      <Route exact path="/discover">
        <Discover />
      </Route>
      <Route exact path="/discover/:slug">
        <CategoryDecks />
      </Route>
      <Route exact path="/decks/:id">
        <DeckDetail />
      </Route>
      <Route exact path="/decks/:id/study">
        <Study />
      </Route>
      <Route exact path="/my-decks">
        <MyDecks />
      </Route>
      <Route exact path="/you">
        <Profile />
      </Route>
      <Route exact path="/download">
        <Download />
      </Route>
      <Route exact path="/signin">
        <SignIn />
      </Route>
      <Route exact path="/signup">
        <SignUp />
      </Route>
      <Route exact path="/admin/decks">
        <EditorGate>
          <LazyRoute>
            <ManageDecks />
          </LazyRoute>
        </EditorGate>
      </Route>
      <Route exact path="/admin/decks/:id">
        <EditorGate>
          <LazyRoute>
            <DeckEditor />
          </LazyRoute>
        </EditorGate>
      </Route>
      <Route exact path="/admin/quizzes">
        <EditorGate>
          <LazyRoute>
            <QuizAdmin />
          </LazyRoute>
        </EditorGate>
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      {/* Catch-all 404 — a pathless route matches anything the routes above
          didn't, so a mistyped/stale URL lands on a friendly dead-end. */}
      <Route>
        <NotFound />
      </Route>
    </IonRouterOutlet>
  );
}
