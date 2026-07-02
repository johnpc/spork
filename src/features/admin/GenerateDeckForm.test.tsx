import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../discover/useShelves', () => ({
  useShelves: () => ({ data: [{ slug: 'languages', title: 'Languages', sortOrder: 1 }] }),
}));

import { GenerateDeckForm } from './GenerateDeckForm';

describe('GenerateDeckForm', () => {
  it('disables generate until a topic is entered, then submits the request', () => {
    const onGenerate = vi.fn().mockResolvedValue({});
    render(<GenerateDeckForm onGenerate={onGenerate} />);
    const btn = screen.getByRole('button', { name: 'Generate with AI' });
    expect(btn).toBeDisabled();

    fireEvent.change(screen.getByLabelText('AI deck topic'), {
      target: { value: 'Top Spanish Phrases' },
    });
    fireEvent.change(screen.getByLabelText('Voice language'), { target: { value: 'es-ES' } });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'Top Spanish Phrases', voiceLanguage: 'es-ES' }),
    );
  });
});
