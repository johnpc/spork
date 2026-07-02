import type { RendererProps } from './renderers';
import { bucketsOf, unsortedItems, itemsInBucket } from './sortableModel';
import { useSortableSelect } from './useSortableSelect';
import './sortable.css';

/**
 * SORTABLE renderer — put each item into its correct bucket. Unsorted chips sit
 * on top; below, each bucket column SHOWS the items dropped into it so progress
 * is visible. Pick a chip then click a bucket → attempt(id, bucket); a correct
 * drop moves the chip into the bucket (green), a wrong one flashes the bucket
 * red and keeps the chip. On 'done', every item is revealed in its true bucket.
 */
export function Sortable({ answers, found, attempt, status }: RendererProps) {
  const buckets = bucketsOf(answers);
  const items = unsortedItems(answers, found);
  const { selectedId, wrongBucket, pick, place } = useSortableSelect(attempt);
  const done = status === 'done';

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
            className={
              wrongBucket === b ? 'sortable__bucket sortable__bucket--wrong' : 'sortable__bucket'
            }
            data-testid="sortable-bucket"
            disabled={!selectedId || done}
            onClick={() => place(b)}
          >
            <span className="sortable__bucket-label">{b}</span>
            <span className="sortable__placed">
              {itemsInBucket(answers, found, b, done).map((a) => (
                <span
                  key={a.id}
                  className={
                    found.has(a.id)
                      ? 'sortable__placed-item'
                      : 'sortable__placed-item sortable__placed-item--revealed'
                  }
                  data-testid="sortable-placed"
                >
                  {a.display}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
