/**
 * Pure shaping for the Discover tab: turn raw Category rows into ordered shelves
 * with a display label. Kept separate from I/O so it's fully unit-testable.
 */
import type { CategoryRecord } from '../../lib/dataClient';

export interface Shelf {
  slug: string;
  title: string;
  sortOrder: number;
}

/** Order by sortOrder (then name) and prefer an explicit label over the name. */
export function composeShelves(categories: Array<CategoryRecord | null>): Shelf[] {
  return categories
    .filter((c): c is CategoryRecord => c !== null && !!c.slug)
    .map((c) => ({
      slug: c.slug,
      title: c.label?.trim() || c.name,
      sortOrder: c.sortOrder ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}
