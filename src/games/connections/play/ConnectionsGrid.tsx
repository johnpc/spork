/**
 * Connections 4×4 grid: 16 tiles (selectable) + solved groups (locked rows).
 * Solved groups render as colored bars with their theme; unsolved tiles shuffle.
 */
import type { Group } from './grouping';
import './connections.css';

interface Props {
  tiles: string[];
  selected: string[];
  solvedGroups: Group[];
  onToggle: (word: string) => void;
  done: boolean;
}

const LEVEL_CLASSES = ['sp-level-0', 'sp-level-1', 'sp-level-2', 'sp-level-3'];

export function ConnectionsGrid({ tiles, selected, solvedGroups, onToggle, done }: Props) {
  // Tiles not yet solved
  const solvedWords = new Set(solvedGroups.flatMap((g) => g.words.map((w) => w.toLowerCase())));
  const remaining = tiles.filter((w) => !solvedWords.has(w.toLowerCase()));

  return (
    <div className="connections-grid">
      {/* Solved groups render first as locked rows */}
      {solvedGroups.map((g, i) => (
        <div
          key={i}
          className={`connections-grid__solved ${LEVEL_CLASSES[g.level] ?? ''}`}
          data-testid="connections-solved"
        >
          <div className="connections-grid__theme">{g.theme}</div>
          <div className="connections-grid__words">{g.words.join(', ')}</div>
        </div>
      ))}

      {/* Remaining tiles as a 4×4 grid */}
      <div className="connections-grid__tiles">
        {remaining.map((word) => {
          const isSelected = selected.includes(word);
          return (
            <button
              key={word}
              className={`connections-grid__tile ${isSelected ? 'connections-grid__tile--selected' : ''}`}
              onClick={() => onToggle(word)}
              disabled={done}
              data-testid="connections-tile"
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
