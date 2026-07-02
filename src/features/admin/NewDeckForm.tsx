import type { NewDeck } from './adminDeckApi';
import { useNewDeckForm } from './useNewDeckForm';
import { useShelves } from '../discover/useShelves';
import { CategorySelect } from './CategorySelect';

/** Inline form to create a new DRAFT deck. Renders only; logic in the hook. */
export function NewDeckForm({ onCreate }: { onCreate: (d: NewDeck) => Promise<string> }) {
  const { data: shelves } = useShelves();
  const slugs = (shelves ?? []).map((s) => s.slug);
  const f = useNewDeckForm(onCreate, slugs);
  return (
    <div className="new-deck" data-testid="new-deck-form">
      <input
        className="new-deck__input"
        placeholder="New deck topic…"
        aria-label="New deck topic"
        value={f.topic}
        onChange={(e) => f.setTopic(e.target.value)}
      />
      <CategorySelect label="Category" value={f.categorySlug} onChange={f.setCategorySlug} />
      <button type="button" className="new-deck__btn" disabled={!f.canSubmit} onClick={f.submit}>
        {f.busy ? 'Creating…' : 'Create'}
      </button>
    </div>
  );
}
