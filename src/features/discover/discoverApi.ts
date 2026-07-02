/**
 * Discover read: the category shelves shown on the launch surface. Thin I/O —
 * the ordering/shaping lives in the pure composeShelves helper so it's unit
 * testable and this stays under the line limit.
 */
import { dataClient, readAuthMode } from '../../lib/dataClient';
import { composeShelves, type Shelf } from './composeShelves';

export type { Shelf } from './composeShelves';

export async function fetchShelves(): Promise<Shelf[]> {
  const authMode = await readAuthMode();
  // Categories are a small reference set — list + shape client-side.
  const { data: categories } = await dataClient.models.Category.list({ limit: 200, authMode });
  return composeShelves(categories);
}
