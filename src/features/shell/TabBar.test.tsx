import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { TabBar } from './TabBar';

function renderTabBar(active?: string) {
  return render(
    <MemoryRouter>
      <TabBar active={active} />
    </MemoryRouter>,
  );
}

describe('TabBar', () => {
  it('marks the active tab with aria-current', () => {
    renderTabBar('Discover');
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders the guest-first tabs as wired links (Games, Discover, You)', () => {
    renderTabBar('Discover');
    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'You' })).toHaveAttribute('href', '/you');
    expect(screen.queryByRole('link', { name: 'My Decks' })).not.toBeInTheDocument();
  });

  it('defaults the active tab to Games', () => {
    renderTabBar();
    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('aria-current', 'page');
  });
});
