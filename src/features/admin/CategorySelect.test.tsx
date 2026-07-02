import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const shelves = vi.hoisted(() => ({ value: undefined as unknown }));
vi.mock('../discover/useShelves', () => ({ useShelves: () => ({ data: shelves.value }) }));

import { CategorySelect } from './CategorySelect';

describe('CategorySelect', () => {
  it('renders an option per real category', () => {
    shelves.value = [
      { slug: 'languages', title: 'Languages', sortOrder: 1 },
      { slug: 'mythology', title: 'Myths & Legends', sortOrder: 2 },
    ];
    render(<CategorySelect label="Category" value="languages" onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Myths & Legends' })).toBeInTheDocument();
  });

  it('shows a create-first hint when no categories exist', () => {
    shelves.value = [];
    render(<CategorySelect label="Category" value="" onChange={vi.fn()} />);
    expect(screen.getByText(/create one first/i)).toBeInTheDocument();
  });
});
