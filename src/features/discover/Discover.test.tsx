import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ value: {} as ReturnType<typeof useShelvesMock> }));
function useShelvesMock() {
  return {
    data: [
      { slug: 'lang', title: 'Languages', sortOrder: 1 },
      { slug: 'myth', title: 'Myths & Legends', sortOrder: 2 },
    ],
    isLoading: false,
  };
}
vi.mock('./useShelves', () => ({ useShelves: () => hook.value }));
vi.mock('../admin/EditorLink', () => ({ EditorLink: () => null }));
// Each section lazy-loads its own decks; stub the section to a marker so this
// test focuses on Discover composing one section per category.
vi.mock('./CategorySection', () => ({
  CategorySection: ({ shelf }: { shelf: { title: string } }) => (
    <div data-testid="cat-section">{shelf.title}</div>
  ),
}));

import { Discover } from './Discover';

function renderDiscover() {
  return render(
    <MemoryRouter>
      <Discover />
    </MemoryRouter>,
  );
}

describe('Discover', () => {
  beforeEach(() => {
    hook.value = useShelvesMock();
  });

  it('renders a collapsible section per category', async () => {
    renderDiscover();
    await waitFor(() => expect(screen.getByText('Languages')).toBeInTheDocument());
    expect(screen.getAllByTestId('cat-section')).toHaveLength(2);
  });

  it('shows skeleton placeholders while shelves load', () => {
    hook.value = { data: undefined as never, isLoading: true };
    const { container } = renderDiscover();
    expect(container.querySelectorAll('.sp-skeleton').length).toBeGreaterThan(0);
    expect(screen.queryAllByTestId('cat-section')).toHaveLength(0);
  });
});
