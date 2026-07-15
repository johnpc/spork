import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type State = ReturnType<typeof base>;
const base = () => ({
  decks: [
    { id: 'd1', topic: 'Spanish', status: 'PUBLISHED' },
    { id: 'd2', topic: 'Greek Gods', status: 'DRAFT' },
  ],
  isLoading: false,
  isError: false,
  retry: vi.fn(),
  create: vi.fn().mockResolvedValue('id'),
  setPublished: vi.fn(),
  remove: vi.fn(),
});
const hook = vi.hoisted(() => ({ value: {} as State }));
vi.mock('./useAdminDecks', () => ({ useAdminDecks: () => hook.value }));
vi.mock('./useGenerateDeck', () => ({
  useGenerateDeck: () => ({ runs: [], isLoading: false, generate: vi.fn(), isGenerating: false }),
}));
vi.mock('./NewDeckForm', () => ({ NewDeckForm: () => <div data-testid="new-deck-form" /> }));
vi.mock('./GenerateDeckForm', () => ({
  GenerateDeckForm: () => <div data-testid="generate-form" />,
}));
vi.mock('./GenerationRuns', () => ({ GenerationRuns: () => null }));

import { ManageDecks } from './ManageDecks';

function renderPage() {
  return render(
    <MemoryRouter>
      <ManageDecks />
    </MemoryRouter>,
  );
}

describe('ManageDecks', () => {
  beforeEach(() => {
    hook.value = base();
  });

  it('lists all decks with their status and links to the editor', () => {
    renderPage();
    expect(screen.getAllByTestId('admin-deck')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Spanish' })).toHaveAttribute(
      'href',
      '/admin/decks/d1',
    );
    expect(screen.getAllByTestId('deck-status')[0]).toHaveTextContent('PUBLISHED');
  });

  it('toggles publish for a draft deck', () => {
    renderPage();
    // Second row is the DRAFT deck -> its button reads "Publish".
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(hook.value.setPublished).toHaveBeenCalledWith({ id: 'd2', published: true });
  });

  it('deletes a deck', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(hook.value.remove).toHaveBeenCalledWith('d1');
  });

  it('surfaces a retry (not a false empty) when the deck list fails to load', () => {
    hook.value = { ...base(), decks: [], isError: true };
    renderPage();
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    expect(screen.queryAllByTestId('admin-deck')).toHaveLength(0);
    // The generate form above stays available even when the list read fails.
    expect(screen.getByTestId('generate-form')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('load-retry'));
    expect(hook.value.retry).toHaveBeenCalledTimes(1);
  });
});
