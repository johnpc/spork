/** The Connections reveal block: on loss, show all 4 groups (theme + words +
 * level color) so the player always sees what they missed. Matches the solved
 * group visual style from ConnectionsGrid. */
import type { Group } from './grouping';
import './connections.css';

interface ConnectionsRevealProps {
  groups: readonly Group[];
  solvedIndices: ReadonlySet<number>;
}

const LEVEL_CLASSES = ['sp-level-0', 'sp-level-1', 'sp-level-2', 'sp-level-3'];

export function ConnectionsReveal({ groups, solvedIndices }: ConnectionsRevealProps) {
  if (groups.length === 0) return null;

  return (
    <div className="connections-reveal" data-testid="connections-reveal" role="status">
      <p className="connections-reveal__title">The groups were:</p>
      <div className="connections-reveal__groups">
        {groups.map((g, i) => (
          <div
            key={i}
            className={`connections-grid__solved ${LEVEL_CLASSES[g.level] ?? ''} ${
              solvedIndices.has(i) ? 'connections-reveal__group--solved' : ''
            }`}
          >
            <div className="connections-grid__theme">{g.theme}</div>
            <div className="connections-grid__words">{g.words.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
