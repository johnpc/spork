import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// App now lands on the Spork Home game shelf ('/'→'/home'); stub the discover
// data hook + probing children so the shell test stays inert (no SDK).
vi.mock('./features/discover/useShelves', () => ({
  useShelves: () => ({ data: [], isLoading: false }),
}));
// CategorySection/EditorLink probe more state — stub to keep the shell test inert.
vi.mock('./features/discover/CategorySection', () => ({ CategorySection: () => null }));
vi.mock('./features/admin/EditorLink', () => ({ EditorLink: () => null }));

// App wraps the tree in AuthProvider, which probes the Cognito session on mount
// via authClient — stub that SDK-touching module.
vi.mock('./features/auth/authClient', () => ({
  currentEmail: vi.fn().mockResolvedValue(null),
  currentGroups: vi.fn().mockResolvedValue([]),
  signIn: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  signOut: vi.fn(),
}));

import App from './App';

describe('App', () => {
  it('renders without crashing', async () => {
    const { baseElement, unmount } = render(<App />);
    expect(baseElement).toBeDefined();
    // Let the async auth probe + initial render settle inside the test (so no
    // state update fires after teardown), then unmount to stop pending work.
    await waitFor(() => expect(screen.getByTestId('home-games')).toBeInTheDocument());
    // ion-router-outlet's connectedCallback lazily `await import()`s its
    // swipe-back gesture module and then reads `document` (RTL check). Under a
    // loaded full-suite run that import can resolve after jsdom is torn down
    // ("document is not defined" unhandled rejection). Wait until the gesture
    // exists, i.e. the outlet's async connect finished, before tearing down.
    await waitFor(() => {
      const outlet = document.querySelector('ion-router-outlet') as { gesture?: unknown } | null;
      expect(outlet?.gesture).toBeDefined();
    });
    unmount();
  });
});
