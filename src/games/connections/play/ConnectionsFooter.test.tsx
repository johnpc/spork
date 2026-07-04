import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectionsFooter } from './ConnectionsFooter';

const base = {
  won: false,
  lost: false,
  done: false,
  oneAway: false,
  canDeselect: false,
  canSubmit: false,
  onDeselectAll: vi.fn(),
  onSubmit: vi.fn(),
};

describe('ConnectionsFooter', () => {
  it('shows the win banner when won', () => {
    render(<ConnectionsFooter {...base} won done />);
    expect(screen.getByTestId('connections-won')).toBeInTheDocument();
  });

  it('shows the loss banner when lost', () => {
    render(<ConnectionsFooter {...base} lost done />);
    expect(screen.getByTestId('connections-lost')).toBeInTheDocument();
  });

  it('shows the one-away hint and controls while playing', () => {
    render(<ConnectionsFooter {...base} oneAway canDeselect canSubmit />);
    expect(screen.getByTestId('connections-hint')).toBeInTheDocument();
    expect(screen.getByTestId('connections-submit')).toBeEnabled();
  });

  it('hides controls once done', () => {
    render(<ConnectionsFooter {...base} won done />);
    expect(screen.queryByTestId('connections-submit')).not.toBeInTheDocument();
  });

  it('fires the callbacks', () => {
    const onDeselectAll = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ConnectionsFooter
        {...base}
        canDeselect
        canSubmit
        onDeselectAll={onDeselectAll}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByText('Deselect All'));
    fireEvent.click(screen.getByTestId('connections-submit'));
    expect(onDeselectAll).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
