import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { Route } from 'react-router-dom';
import { gameRoutes } from './GameRoutes';

// Regression guard: IonRouterOutlet only matches among its DIRECT <Route>
// children. gameRoutes() MUST return an ARRAY of <Route>s (which flattens into
// direct children when spread as {gameRoutes()}) — never a fragment, whose
// nested routes are invisible to the outlet and get shadowed by the 404
// catch-all. This test locks that contract.
describe('gameRoutes', () => {
  const routes = gameRoutes();

  it('returns an array (not a fragment) so routes flatten as direct children', () => {
    expect(Array.isArray(routes)).toBe(true);
  });

  it('is a non-empty list of Route elements, each with a path and a key', () => {
    expect(routes.length).toBeGreaterThan(0);
    for (const r of routes) {
      expect(isValidElement(r)).toBe(true);
      expect(r.type).toBe(Route);
      expect(typeof r.props.path).toBe('string');
      expect(r.key).toBeTruthy(); // stable keys for the array
    }
  });

  it('covers every game island list + play route', () => {
    const paths = routes.map((r) => r.props.path);
    for (const p of [
      '/daily/:game',
      '/quizzes',
      '/quizzes/:id/play',
      '/steps',
      '/steps/:id',
      '/acrostic',
      '/acrostic/:id',
      '/quizzle',
      '/quizzle/:id',
      '/chess',
      '/chess/:id',
    ]) {
      expect(paths).toContain(p);
    }
  });

  it('uses unique keys (no React duplicate-key collisions)', () => {
    const keys = routes.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
