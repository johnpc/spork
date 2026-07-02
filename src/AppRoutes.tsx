import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { Discover } from './features/discover/Discover';
import { CategoryDecks } from './features/discover/CategoryDecks';
import { DeckDetail } from './features/deck/DeckDetail';
import { Study } from './features/study/Study';
import { MyDecks } from './features/mydecks/MyDecks';
import { Profile } from './features/profile/Profile';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { EditorGate } from './features/admin/EditorGate';
import { ManageDecks } from './features/admin/ManageDecks';
import { DeckEditor } from './features/admin/DeckEditor';

/** App routes. Tabs + screens grow per slice; Discover is the launch surface. */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
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
      <Route exact path="/signin">
        <SignIn />
      </Route>
      <Route exact path="/signup">
        <SignUp />
      </Route>
      <Route exact path="/admin/decks">
        <EditorGate>
          <ManageDecks />
        </EditorGate>
      </Route>
      <Route exact path="/admin/decks/:id">
        <EditorGate>
          <DeckEditor />
        </EditorGate>
      </Route>
      <Route exact path="/">
        <Redirect to="/discover" />
      </Route>
    </IonRouterOutlet>
  );
}
