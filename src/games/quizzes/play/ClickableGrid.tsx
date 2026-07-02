import { useMemo, useState, useCallback } from 'react';
import type { RendererProps } from './renderers';
import { buildTiles, decoysOf, type Tile } from './clickTiles';
import './clickable.css';

/**
 * CLICKABLE renderer — "click the correct tiles out of a displayed set". The
 * grid mixes the quiz's answer tiles (correct) with decoy tiles (from the shared
 * `options` pool). Clicking a tile calls `attempt(answer.id)` — the engine marks
 * it found under MEMBERSHIP scoring; a decoy tile (no id) can never score, so it
 * just flashes a miss. Found state is read from the engine's `found` set (answer
 * ids), keeping this renderer a thin view over the mode-agnostic engine.
 */
export function ClickableGrid({ answers, found, attempt }: RendererProps) {
  const tiles = useMemo(() => buildTiles(answers, decoysOf(answers)), [answers]);
  const [missed, setMissed] = useState<ReadonlySet<string>>(new Set());

  const onTile = useCallback(
    (tile: Tile) => {
      if (tile.answerId && found.has(tile.answerId)) return;
      const hit = attempt(tile.answerId);
      if (!hit) setMissed((prev) => new Set(prev).add(tile.key));
    },
    [attempt, found],
  );

  return (
    <div className="clickable-grid" data-testid="clickable-grid">
      {tiles.map((tile) => {
        const isFound = !!tile.answerId && found.has(tile.answerId);
        const isMissed = !isFound && missed.has(tile.key);
        return (
          <button
            key={tile.key}
            type="button"
            className={`clickable-tile${isFound ? ' clickable-tile--found' : ''}${isMissed ? ' clickable-tile--missed' : ''}`}
            data-testid={isFound ? 'clickable-found' : 'clickable-tile'}
            aria-pressed={isFound}
            onClick={() => onTile(tile)}
          >
            {tile.label}
          </button>
        );
      })}
    </div>
  );
}
