import { useMemo } from 'react';
import { classicSlots } from './classicSlots';
import type { RendererProps } from './renderers';
import './classic.css';

/**
 * CLASSIC renderer — "name the hidden list" (e.g. US Presidents). CLASSIC is a
 * TYPED-INPUT mode: the player types into the shared PlayInput, so this renderer
 * ignores `attempt` and only PROJECTS the engine's found set onto a fixed grid
 * of slots. Each slot starts blank and pops to its display label once its answer
 * id lands in `found`. Reads only { answers, found } — the mode-agnostic seam.
 */
export function ClassicList({ answers, found }: RendererProps) {
  const slots = useMemo(() => classicSlots(answers, found), [answers, found]);
  return (
    <ol className="classic-list" data-testid="classic-list">
      {slots.map((slot, i) => (
        <li
          key={slot.id}
          className={slot.found ? 'classic-slot classic-slot--found' : 'classic-slot'}
          data-testid={slot.found ? 'classic-found' : 'classic-blank'}
        >
          <span className="classic-slot__num">{i + 1}</span>
          <span className="classic-slot__label">{slot.found ? slot.display : ''}</span>
        </li>
      ))}
    </ol>
  );
}
