import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// The form reads real categories via useShelves — stub it with two shelves.
vi.mock('../discover/useShelves', () => ({
  useShelves: () => ({
    data: [
      { slug: 'languages', title: 'Languages', sortOrder: 1 },
      { slug: 'mythology', title: 'Myths & Legends', sortOrder: 2 },
    ],
  }),
}));

import { NewDeckForm } from './NewDeckForm';

describe('NewDeckForm', () => {
  it('disables create until a topic is typed, then submits topic + category', async () => {
    const onCreate = vi.fn().mockResolvedValue('id');
    render(<NewDeckForm onCreate={onCreate} />);
    const btn = screen.getByRole('button', { name: 'Create' });
    expect(btn).toBeDisabled();

    fireEvent.change(screen.getByLabelText('New deck topic'), { target: { value: 'Greek Gods' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'mythology' } });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalledWith({ topic: 'Greek Gods', categorySlug: 'mythology' });
  });
});
