import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type Auth = { status: string; email: string | null; signOut: () => void };
const auth = vi.hoisted(() => ({ value: {} as Auth }));
const editor = vi.hoisted(() => ({ isEditor: false }));
vi.mock('../auth/useAuth', () => ({ useAuth: () => auth.value }));
vi.mock('../admin/useIsEditor', () => ({ useIsEditor: () => editor }));
vi.mock('../stats/StreakCard', () => ({ StreakCard: () => <div data-testid="streak" /> }));
vi.mock('../reminders/ReminderToggle', () => ({ ReminderToggle: () => null }));

import { Profile } from './Profile';

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
}

describe('Profile', () => {
  beforeEach(() => {
    auth.value = { status: 'authenticated', email: 'john@example.com', signOut: vi.fn() };
    editor.isEditor = false;
  });

  it('prompts a guest to sign in', () => {
    auth.value = { status: 'unauthenticated', email: null, signOut: vi.fn() };
    renderProfile();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin');
  });

  it('shows the signed-in email and a sign-out button', () => {
    renderProfile();
    expect(screen.getByTestId('profile-email')).toHaveTextContent('john@example.com');
    fireEvent.click(screen.getByTestId('profile-signout'));
    expect(auth.value.signOut).toHaveBeenCalled();
  });

  it('hides the Manage link for non-editors', () => {
    renderProfile();
    expect(screen.queryByTestId('profile-manage')).not.toBeInTheDocument();
  });

  it('shows the Manage link + Editor badge for editors', () => {
    editor.isEditor = true;
    renderProfile();
    expect(screen.getByTestId('profile-manage')).toHaveAttribute('href', '/admin/decks');
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });
});
