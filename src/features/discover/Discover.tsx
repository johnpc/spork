import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useShelves } from './useShelves';
import { CategorySection } from './CategorySection';
import { TabBar } from '../shell/TabBar';
import { EditorLink } from '../admin/EditorLink';
import './discover.css';

/** Discover tab — collapsible category sections that preview their decks
 * inline. The first section starts expanded. Renders only. */
export function Discover() {
  const { data: shelves, isLoading } = useShelves();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" data-testid="discover-back" />
          </IonButtons>
          <IonTitle>Discover</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1 className="sp-heading discover__title">Find a deck</h1>
        <p className="sp-muted discover__subtitle">Browse decks by category and start learning.</p>
        <EditorLink />
        {isLoading ? (
          <div aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="discover__shelf discover__shelf--skeleton" />
            ))}
          </div>
        ) : (
          <div className="discover__sections" aria-label="Categories">
            {(shelves ?? []).map((shelf, i) => (
              <CategorySection key={shelf.slug} shelf={shelf} defaultOpen={i === 0} />
            ))}
          </div>
        )}
        <TabBar active="Discover" />
      </IonContent>
    </IonPage>
  );
}
