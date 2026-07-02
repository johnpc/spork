import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-router-dom', () => ({
  Redirect: ({ to }: { to: string }) => <div>redirect:{to}</div>,
}));

const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('../auth/useAuth', () => ({ useAuth: () => auth }));

const editor = vi.hoisted(() => ({ value: { isEditor: false, isLoading: false } }));
vi.mock('./useIsEditor', () => ({ useIsEditor: () => editor.value }));

import { EditorGate } from './EditorGate';

const child = <div>authoring</div>;

describe('EditorGate', () => {
  beforeEach(() => {
    auth.status = 'authenticated';
    editor.value = { isEditor: false, isLoading: false };
  });

  it('renders nothing while loading', () => {
    auth.status = 'loading';
    const { container } = render(<EditorGate>{child}</EditorGate>);
    expect(container.textContent).toBe('');
  });

  it('redirects signed-out users to sign-in', () => {
    auth.status = 'unauthenticated';
    render(<EditorGate>{child}</EditorGate>);
    expect(screen.getByText('redirect:/signin')).toBeInTheDocument();
  });

  it('redirects signed-in non-editors to Discover', () => {
    render(<EditorGate>{child}</EditorGate>);
    expect(screen.getByText('redirect:/discover')).toBeInTheDocument();
  });

  it('renders children for editors', () => {
    editor.value = { isEditor: true, isLoading: false };
    render(<EditorGate>{child}</EditorGate>);
    expect(screen.getByText('authoring')).toBeInTheDocument();
  });
});
