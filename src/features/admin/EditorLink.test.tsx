import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const editor = vi.hoisted(() => ({ value: { isEditor: false, isLoading: false } }));
vi.mock('./useIsEditor', () => ({ useIsEditor: () => editor.value }));

import { EditorLink } from './EditorLink';

function renderLink() {
  return render(
    <MemoryRouter>
      <EditorLink />
    </MemoryRouter>,
  );
}

describe('EditorLink', () => {
  beforeEach(() => {
    editor.value = { isEditor: false, isLoading: false };
  });

  it('renders the manage link for editors', () => {
    editor.value = { isEditor: true, isLoading: false };
    renderLink();
    expect(screen.getByTestId('manage-link')).toHaveAttribute('href', '/admin/decks');
  });

  it('renders nothing for non-editors', () => {
    const { container } = renderLink();
    expect(container.querySelector('[data-testid="manage-link"]')).toBeNull();
  });
});
