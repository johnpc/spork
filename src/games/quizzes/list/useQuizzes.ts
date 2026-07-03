import { useQuery } from '@tanstack/react-query';
import { fetchPublishedQuizzes } from './quizListApi';

/** Load published quizzes for the Quizzes home. */
export function useQuizzes() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: fetchPublishedQuizzes,
  });
  return { quizzes: data ?? [], isLoading, isError, refetch };
}
