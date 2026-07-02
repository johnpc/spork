import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('world-atlas/countries-110m.json', () => ({ default: { type: 'Topology' } }));
// Skip topology parsing — the fit only needs some centroids for the mocked ids.
vi.mock('./mapClickCentroids', () => ({ centroidsFor: () => [[10, 10]] }));

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ZoomableGroup: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  Geographies: ({ children }: { children: (a: { geographies: unknown[] }) => ReactNode }) =>
    children({
      geographies: [
        { rsmKey: 'k1', id: '566' }, // Nigeria — answer a1
        { rsmKey: 'k2', id: '818' }, // Egypt — answer a2
        { rsmKey: 'k3', id: '999' }, // not an answer → inert
      ],
    }),
  Geography: ({ className, onClick, ...rest }: Record<string, unknown>) => (
    <path
      className={className as string}
      data-region={rest['data-region'] as string}
      data-testid={rest['data-testid'] as string}
      onClick={onClick as () => void}
    />
  ),
}));

import { ClickableMap } from './ClickableMap';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', promptKind: 'REGION', promptValue: '566', display: 'Nigeria' },
  { id: 'a2', promptKind: 'REGION', promptValue: '818', display: 'Egypt' },
] as AnswerRecord[];

const byRegion = (c: HTMLElement, r: string) =>
  Array.from(c.querySelectorAll('path')).find((p) => p.getAttribute('data-region') === r);

describe('ClickableMap', () => {
  it('prompts for the first unfound country', () => {
    render(<ClickableMap answers={answers} found={new Set()} attempt={() => false} />);
    expect(screen.getByTestId('clickable-prompt')).toHaveTextContent('Find Nigeria');
  });

  it('scores only the prompted target; clicking the wrong country flashes red', () => {
    const attempt = vi.fn(() => true);
    const { container } = render(
      <ClickableMap answers={answers} found={new Set()} attempt={attempt} />,
    );
    // Wrong click (Egypt while asked for Nigeria) — no score, region flashes wrong.
    fireEvent.click(byRegion(container, '818') as Element);
    expect(attempt).not.toHaveBeenCalled();
    expect(byRegion(container, '818')?.getAttribute('class')).toContain('sp-region--wrong');
    // Correct click (Nigeria) scores.
    fireEvent.click(byRegion(container, '566') as Element);
    expect(attempt).toHaveBeenCalledWith('a1');
  });

  it('marks found regions and leaves non-answers inert', () => {
    const { container } = render(
      <ClickableMap answers={answers} found={new Set(['a1'])} attempt={() => false} />,
    );
    expect(byRegion(container, '566')?.getAttribute('class')).toContain('sp-region--found');
    expect(byRegion(container, '999')?.getAttribute('class')).toContain('sp-region--inert');
  });
});
