// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';

// Raise the default async timeout so waitFor assertions don't flake under the
// CPU contention of the pre-commit hook / CI (build + tests running together).
configure({ asyncUtilTimeout: 5000 });

// Node 26 defines `globalThis.localStorage` as an own property whose value is
// `undefined` (Web Storage without --localstorage-file), and Vitest's jsdom
// environment never overwrites an existing global, so tests would see no
// storage at all. The package.json vitest scripts therefore run with
// NODE_OPTIONS=--no-experimental-webstorage, which removes Node's property and
// lets jsdom's storage through. Fail loudly if a run bypassed those scripts.
if (typeof window !== 'undefined' && window.localStorage === undefined) {
  throw new Error(
    'localStorage is undefined: run Vitest via the npm scripts (NODE_OPTIONS=--no-experimental-webstorage)',
  );
}

// Isolate localStorage between tests: several play screens read/write the daily
// play-once store, so a "solved" case in one test would otherwise leak into the
// next (e.g. tripping the daily guard). Clear it before every test.
beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom without storage — nothing to clear */
  }
});

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };
