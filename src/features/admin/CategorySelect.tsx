import { useShelves } from '../discover/useShelves';

/**
 * Category picker backed by the REAL Category rows (the Discover shelves), not a
 * hardcoded list — so an admin can only tag a deck with a category that has a
 * shelf to surface it under. Prevents the "published deck with no shelf →
 * invisible in Discover" class of bug.
 */
export function CategorySelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (slug: string) => void;
  label: string;
}) {
  const { data: shelves } = useShelves();
  const options = shelves ?? [];
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.length === 0 ? (
        <option value="">No categories — create one first</option>
      ) : (
        options.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.title}
          </option>
        ))
      )}
    </select>
  );
}
