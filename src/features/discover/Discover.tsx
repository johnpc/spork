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
import { Skeleton } from '../shell/Skeleton';
import { LoadState } from '../shell/LoadState';
import './discover.css';

/** Discover tab — collapsible category sections that preview their decks
 * inline. The first section starts expanded. Renders only. */
export function Discover() {
  const { data: shelves, isLoading, isError, refetch } = useShelves();
  const skeleton = (
    <div className="discover__skeletons" aria-busy="true" aria-label="Loading categories">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} height="60px" radius="var(--sp-radius)" />
      ))}
    </div>
  );
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
        {/* Error now surfaces a retry instead of a silently empty shelf list. */}
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && (shelves ?? []).length === 0}
          emptyTitle="No categories yet"
          onRetry={() => void refetch()}
          skeleton={skeleton}
        >
          <div className="discover__sections" aria-label="Categories">
            {(shelves ?? []).map((shelf, i) => (
              <CategorySection key={shelf.slug} shelf={shelf} defaultOpen={i === 0} />
            ))}
          </div>
        </LoadState>
        <TabBar active="Discover" />
      </IonContent>
    </IonPage>
  );
}
