import { Suspense, type ReactNode } from 'react';
import { SkeletonRows } from './SkeletonRows';

/** Suspense boundary for a lazy-loaded route element. IonRouterOutlet only
 * matches DIRECT <Route> children, so the boundary must live INSIDE the route
 * element (not around the outlet). Shared by the game + admin lazy routes so the
 * fallback and rule stay in one place. */
export function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="ion-padding">
          <SkeletonRows />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
