import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../features/discover/useShelves', () => ({
  useShelves: () => ({ data: [{ slug: 'history', title: 'History' }] }),
}));
vi.mock('../../../features/admin/CategorySelect', () => ({
  CategorySelect: ({ value }: { value: string }) => <div data-testid="cat">{value}</div>,
}));

import { GenerateQuizForm } from './GenerateQuizForm';

describe('GenerateQuizForm', () => {
  it('generates with the chosen mode, topic, and count', async () => {
    const onGenerate = vi.fn().mockResolvedValue(undefined);
    render(<GenerateQuizForm onGenerate={onGenerate} />);
    fireEvent.change(screen.getByLabelText('Quiz mode'), { target: { value: 'MULTIPLE_CHOICE' } });
    fireEvent.change(screen.getByLabelText('AI quiz topic'), { target: { value: 'Capitals' } });
    fireEvent.click(screen.getByTestId('quiz-gen-submit'));
    await waitFor(() =>
      expect(onGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'MULTIPLE_CHOICE', topicOrTemplate: 'Capitals' }),
      ),
    );
  });

  it('disables submit until a topic is entered', () => {
    render(<GenerateQuizForm onGenerate={vi.fn()} />);
    expect(screen.getByTestId('quiz-gen-submit')).toBeDisabled();
  });
});
