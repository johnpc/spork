import { Suspense, type ReactNode } from 'react';

/** Suspense boundary for a lazy-loaded route element. IonRouterOutlet only
 * matches DIRECT <Route> children, so the boundary must live INSIDE the route
 * element (not around the outlet). Shared by the game + admin lazy routes so the
 * fallback and rule stay in one place. */
export function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="sp-muted ion-padding">Loading…</p>}>{children}</Suspense>
  );
}
