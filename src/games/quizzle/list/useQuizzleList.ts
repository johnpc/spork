import { useQuery } from '@tanstack/react-query';
import { fetchQuizzles } from '../play/quizzleApi';

/** Load published quizzles for the Quizzle home. */
export function useQuizzleList() {
  const { data, isLoading } = useQuery({ queryKey: ['quizzles'], queryFn: fetchQuizzles });
  return { quizzles: data ?? [], isLoading };
}
