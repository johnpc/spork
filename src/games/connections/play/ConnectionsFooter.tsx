/** The Connections footer: win/loss banners, the "one away" hint, and (while the
 * game is live) the Deselect All / Submit controls. Split from the play screen to
 * keep each file single-purpose. */
import type { Group } from './grouping';
import { ConnectionsReveal } from './ConnectionsReveal';

interface ConnectionsFooterProps {
  won: boolean;
  lost: boolean;
  done: boolean;
  oneAway: boolean;
  canDeselect: boolean;
  canSubmit: boolean;
  onDeselectAll: () => void;
  onSubmit: () => void;
  groups: readonly Group[];
  solvedIndices: ReadonlySet<number>;
}

export function ConnectionsFooter(p: ConnectionsFooterProps) {
  return (
    <>
      {p.won && (
        <p className="connections__won" data-testid="connections-won" role="status">
          All groups found!
        </p>
      )}
      {p.lost && <ConnectionsReveal groups={p.groups} solvedIndices={p.solvedIndices} />}
      {!p.done && (
        <>
          {p.oneAway && (
            <p className="connections__hint" data-testid="connections-hint">
              One away! Three of your picks belong to a group.
            </p>
          )}
          <div className="connections__actions">
            <button onClick={p.onDeselectAll} disabled={!p.canDeselect}>
              Deselect All
            </button>
            <button onClick={p.onSubmit} disabled={!p.canSubmit} data-testid="connections-submit">
              Submit
            </button>
          </div>
        </>
      )}
    </>
  );
}
