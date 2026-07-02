import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const m = vi.hoisted(() => ({ listReviews: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { UserCardReview: { listUserCardReviewByDeckIdAndDueAt: m.listReviews } } },
}));
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));

import { DeckMastery } from './DeckMastery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('DeckMastery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
  });

  it('shows mastery once some cards are mastered', async () => {
    m.listReviews.mockResolvedValue({
      data: [{ repetitions: 3 }, { repetitions: 5 }, { repetitions: 0 }],
    });
    render(<DeckMastery deckId="d1" cardCount={4} />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('deck-mastery')).toBeInTheDocument());
    expect(screen.getByText(/2\/4 · 50%/)).toBeInTheDocument();
  });

  it('renders nothing when no cards are mastered', async () => {
    m.listReviews.mockResolvedValue({ data: [{ repetitions: 1 }] });
    const { container } = render(<DeckMastery deckId="d1" cardCount={4} />, { wrapper });
    await waitFor(() => expect(m.listReviews).toHaveBeenCalled());
    expect(container.querySelector('[data-testid="deck-mastery"]')).toBeNull();
  });

  it('does not fetch for a guest', () => {
    auth.status = 'unauthenticated';
    render(<DeckMastery deckId="d1" cardCount={4} />, { wrapper });
    expect(m.listReviews).not.toHaveBeenCalled();
  });
});
