import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddCardForm } from './AddCardForm';

describe('AddCardForm', () => {
  it('requires both front and back before adding', () => {
    render(<AddCardForm onAdd={vi.fn()} />);
    const btn = screen.getByRole('button', { name: 'Add card' });
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByLabelText('New card front'), { target: { value: 'Hola' } });
    expect(btn).toBeDisabled(); // back still empty
    fireEvent.change(screen.getByLabelText('New card back'), { target: { value: 'Hello' } });
    expect(btn).toBeEnabled();
  });

  it('adds the trimmed card and clears the fields', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddCardForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText('New card front'), { target: { value: ' Hola ' } });
    fireEvent.change(screen.getByLabelText('New card back'), { target: { value: ' Hello ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add card' }));
    expect(onAdd).toHaveBeenCalledWith({ front: 'Hola', back: 'Hello' });
    await waitFor(() => expect(screen.getByLabelText('New card front')).toHaveValue(''));
  });
});
