/** react-query hook for the Discover shelves. All fetching goes through here. */
import { useQuery } from '@tanstack/react-query';
import { fetchShelves } from './discoverApi';

export function useShelves() {
  return useQuery({ queryKey: ['shelves'], queryFn: fetchShelves });
}
