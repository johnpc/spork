import type { RendererProps } from './renderers';
import { bucketsOf, unsortedItems } from './sortableModel';
import { useSortableSelect } from './useSortableSelect';
import './sortable.css';

/**
 * SORTABLE renderer — put each item into its correct bucket/category. The
 * unsorted chips (answers not yet in the engine's found set) sit above the
 * bucket columns, which are DERIVED from the distinct answer.bucket values. The
 * player picks a chip then clicks a bucket, calling attempt(id, bucket); the
 * BUCKETING scoring rule only counts a correct bucket, so a wrong drop is a
 * no-op and the chip stays. Reads the RendererProps contract every mode honors.
 */
export function Sortable({ answers, found, attempt }: RendererProps) {
  const buckets = bucketsOf(answers);
  const items = unsortedItems(answers, found);
  const { selectedId, pick, place } = useSortableSelect(attempt);

  return (
    <div className="sortable" data-testid="sortable">
      <div className="sortable__items" data-testid="sortable-items">
        {items.length === 0 ? (
          <span className="sortable__empty" data-testid="sortable-empty">
            All sorted!
          </span>
        ) : (
          items.map((a) => (
            <button
              key={a.id}
              type="button"
              data-testid="sortable-item"
              className={
                selectedId === a.id ? 'sortable__chip sortable__chip--selected' : 'sortable__chip'
              }
              aria-pressed={selectedId === a.id}
              onClick={() => pick(a.id)}
            >
              {a.display}
            </button>
          ))
        )}
      </div>
      <div className="sortable__buckets" data-testid="sortable-buckets">
        {buckets.map((b) => (
          <button
            key={b}
            type="button"
            className="sortable__bucket"
            data-testid="sortable-bucket"
            disabled={!selectedId}
            onClick={() => place(b)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}
